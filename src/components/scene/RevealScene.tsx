import { useEffect, useRef } from 'react'
import { animate, motion } from 'framer-motion'
import type { AlbumSettings } from '../../types/album'
import { useBookSize } from '../../hooks/useBookSize'
import { SolidBook } from '../book/SolidBook'

interface Props { settings: AlbumSettings; onDone: () => void }

/**
 * Livro caindo da estante: desliza, tomba na borda, cai girando em 3D,
 * quica na mesa, assenta e a câmera desce até enquadrá-lo de frente.
 */
export function RevealScene({ settings, onDone }: Props) {
  const { w, h, vw, vh } = useBookSize()
  const bookRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const wallRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const lipRef = useRef<HTMLDivElement>(null)

  // Geometria da cena (px, relativa ao centro da tela)
  const s0 = Math.min(vh * 0.34, 260) / h        // escala do livro na estante
  const s1 = s0 * 1.55                            // escala quando está na mesa (mais perto da câmera)
  const shelfY = vh * 0.4                         // topo da prateleira
  const shelfL = vw * 0.12
  const shelfR = vw * 0.62
  const tableY = vh * 0.8
  const bw = w * s0, bh = h * s0
  const x0 = shelfR - bw * 0.95 - vw / 2
  const xEdge = shelfR - bw * 0.1 - vw / 2
  const yShelf = shelfY - bh / 2 - vh / 2
  const xLand = vw * 0.04
  const yLand = tableY - vh / 2 - h * s1 * 0.18 + 6

  useEffect(() => {
    const book = bookRef.current!, shadow = shadowRef.current!, wall = wallRef.current!, table = tableRef.current!, lip = lipRef.current!
    let cancelled = false

    const run = async () => {
      await animate(book, { x: x0, y: yShelf, scale: s0, rotateZ: 0, rotateX: 0, rotateY: 14, opacity: 1 }, { duration: 0 })
      await animate(shadow, { opacity: 0 }, { duration: 0 })
      await animate(wall, { opacity: 1 }, { duration: 1.1, ease: 'easeOut' })
      if (cancelled) return
      await new Promise((r) => setTimeout(r, 450))

      // 1) o livro se mexe e escorrega devagar até a borda
      await animate(book, { rotateZ: [0, -0.8, 0.5, 0], x: [x0, x0 + 6, x0 + 4, x0 + (xEdge - x0) * 0.55, xEdge] }, { duration: 2.1, ease: 'easeInOut', times: [0, 0.14, 0.26, 0.7, 1] })
      if (cancelled) return

      // 2) tomba na quina (centro de massa passou da borda)
      await animate(book, { x: xEdge + bw * 0.28, y: yShelf + bh * 0.12, rotateZ: 24, rotateY: 8 }, { duration: 0.55, ease: [0.5, 0, 0.9, 0.6] })
      if (cancelled) return

      // 3) queda livre girando em 3D
      animate(shadow, { opacity: 0.55, scaleX: 1 }, { duration: 0.8, ease: 'easeIn' })
      await animate(book, {
        x: xLand, y: yLand, scale: s1, rotateZ: 44, rotateX: 68, rotateY: -10,
      }, { duration: 0.8, ease: [0.55, 0.02, 0.9, 0.55] })
      if (cancelled) return

      // 4) pancada e quique
      await animate(book, { y: yLand - 26, rotateX: 62, rotateZ: 30 }, { duration: 0.2, ease: 'easeOut' })
      await animate(book, { y: yLand, rotateX: 68, rotateZ: 14 }, { duration: 0.22, ease: 'easeIn' })
      await animate(book, { y: yLand - 8, rotateX: 66, rotateZ: 8 }, { duration: 0.12, ease: 'easeOut' })
      await animate(book, { y: yLand, rotateX: 68, rotateZ: 6 }, { duration: 0.14, ease: 'easeIn' })
      await new Promise((r) => setTimeout(r, 650))
      if (cancelled) return

      // 5) a câmera desce e aproxima: a mesa toma a tela inteira
      animate(shadow, { opacity: 0 }, { duration: 1 })
      animate(lip, { opacity: 0 }, { duration: 0.8 })
      animate(table, { top: 0, backgroundColor: '#292522' }, { duration: 1.9, ease: [0.65, 0, 0.25, 1] })
      animate(wall, { y: -vh * 0.4, opacity: 0 }, { duration: 1.9, ease: [0.65, 0, 0.25, 1] })
      await animate(book, { x: 0, y: -22, scale: 1, rotateX: 0, rotateY: 18, rotateZ: 0 }, { duration: 1.9, ease: [0.65, 0, 0.25, 1] })
      if (!cancelled) onDone()
    }
    void run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#292522' }}>
      {/* parede + prateleira */}
      <div ref={wallRef} style={{ position: 'absolute', inset: 0, background: '#332d29', opacity: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '220px', opacity: 0.45 }} />
        <Shelf left={shelfL} right={shelfR} top={shelfY} vh={vh} />
      </div>

      {/* mesa */}
      <div ref={tableRef} style={{ position: 'absolute', left: 0, right: 0, top: tableY, bottom: 0, background: '#241f1c', zIndex: 2 }}>
        <div ref={lipRef} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: '#5b4636' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '220px', opacity: 0.4 }} />
      </div>

      {/* sombra de contato */}
      <div ref={shadowRef} style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 3, width: w * s1 * 1.05, height: 34, marginLeft: -(w * s1 * 1.05) / 2 + xLand, marginTop: yLand + h * s1 * 0.2, background: '#000', borderRadius: '50%', filter: 'blur(14px)', opacity: 0, transform: 'scaleX(.6)' }} />

      {/* livro */}
      <div style={{ position: 'absolute', inset: 0, perspective: 2400, zIndex: 4, pointerEvents: 'none' }}>
        <motion.div ref={bookRef} style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -w / 2, marginTop: -h / 2, transformStyle: 'preserve-3d', opacity: 0 }}>
          <SolidBook settings={settings} w={w} h={h} initialRotateY={0} />
        </motion.div>
      </div>
    </div>
  )
}

function Shelf({ left, right, top, vh }: { left: number; right: number; top: number; vh: number }) {
  const spines = [
    { w: 26, h: 0.2, c: '#6b5444' }, { w: 20, h: 0.17, c: '#8B7562' }, { w: 30, h: 0.22, c: '#3f322b' },
    { w: 18, h: 0.16, c: '#a08c74' }, { w: 24, h: 0.19, c: '#57443a' }, { w: 22, h: 0.21, c: '#7d6a58' },
  ]
  return (
    <>
      <div style={{ position: 'absolute', left, top: top - 0, width: right - left, height: 14, background: '#7a5c44', boxShadow: '0 22px 30px -10px rgba(0,0,0,.55)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: 'rgba(245,240,230,.16)' }} />
      </div>
      <div style={{ position: 'absolute', left, top: top + 14, width: right - left, height: 9, background: '#4f3a2b' }} />
      <div style={{ position: 'absolute', left: left + 40, top: top + 23, width: 10, height: 46, background: '#3f2f24', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 40%)' }} />
      <div style={{ position: 'absolute', left: right - 120, top: top + 23, width: 10, height: 46, background: '#3f2f24', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 40%)' }} />
      <div style={{ position: 'absolute', left: left + 12, bottom: `calc(100% - ${top}px)`, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
        {spines.map((s, i) => (
          <div key={i} style={{ width: s.w, height: vh * s.h, background: s.c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)', position: 'relative', transform: i === 5 ? 'rotate(4deg)' : undefined, transformOrigin: 'bottom left' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '14%', height: 2, background: 'rgba(232,221,200,.3)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: '14%', height: 2, background: 'rgba(232,221,200,.3)' }} />
          </div>
        ))}
      </div>
    </>
  )
}

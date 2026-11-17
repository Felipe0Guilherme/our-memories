import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { Album } from '../../types/album'
import { useBookSize } from '../../hooks/useBookSize'
import { sleep } from '../../lib/format'
import { BookReader, type ReaderHandle } from './BookReader'
import { SolidBook } from './SolidBook'
import { CoverArt } from './CoverArt'
import { EndpaperFace } from './Endpaper'

type Phase = 'resting' | 'straightening' | 'opening' | 'open' | 'closing' | 'unstraightening'

interface Props {
  album: Album
  isDemo: boolean
  /** true quando o livro acabou de pousar na cena de queda. */
  fromReveal: boolean
}

const OPEN_MS = 1500

export function BookStage({ album, isDemo, fromReveal }: Props) {
  const { w, h, portrait } = useBookSize()
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('resting')
  const [label, setLabel] = useState('')
  const reader = useRef<ReaderHandle | null>(null)
  const busy = useRef(false)

  const openBook = useCallback(async () => {
    if (busy.current || phase !== 'resting') return
    busy.current = true
    setPhase('straightening'); await sleep(reduce ? 0 : 560)
    setPhase('opening'); await sleep(reduce ? 0 : OPEN_MS + 80)
    setPhase('open'); busy.current = false
  }, [phase, reduce])

  const closeBook = useCallback(async () => {
    if (busy.current || phase !== 'open') return
    busy.current = true
    await reader.current?.goToStart()
    setPhase('closing'); await sleep(reduce ? 0 : OPEN_MS + 80)
    setPhase('unstraightening'); await sleep(reduce ? 0 : 580)
    setPhase('resting'); busy.current = false
  }, [phase, reduce])

  const readerVisible = phase === 'opening' || phase === 'open' || phase === 'closing'
  const coverMounted = phase === 'opening' || phase === 'closing'
  const leftHalfVisible = phase === 'open'
  const bookW = portrait ? w : w * 2
  const idleX = portrait ? 0 : -w / 2

  useEffect(() => { document.body.classList.remove('admin-mode') }, [])

  return (
    <motion.div
      initial={fromReveal ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      style={{ position: 'fixed', inset: 0, background: '#292522', display: 'grid', placeItems: 'center', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '220px', opacity: 0.35, pointerEvents: 'none' }} />

      <div style={{ perspective: 2400, width: bookW, height: h, position: 'relative', marginTop: -22 }}>
        {(phase === 'resting' || phase === 'straightening' || phase === 'unstraightening') && (
          <div style={{ position: 'absolute', left: portrait ? 0 : w / 2, top: 0, transformStyle: 'preserve-3d' }}>
            <SolidBook
              key={phase === 'unstraightening' ? 'u' : 's'}
              settings={album.settings} w={w} h={h}
              initialRotateY={phase === 'unstraightening' ? 0 : 18}
              animateRotateY={phase === 'straightening' ? 0 : phase === 'unstraightening' ? 18 : undefined}
              rotateDuration={reduce ? 0 : 0.55}
            />
          </div>
        )}

        {readerVisible && (
          <motion.div
            initial={{ x: idleX }}
            animate={{ x: phase === 'closing' ? idleX : 0 }}
            transition={{ duration: reduce ? 0 : OPEN_MS / 1000, ease: [0.45, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}
          >
            {leftHalfVisible && <div style={{ position: 'absolute', inset: 0, boxShadow: '0 30px 60px -14px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.4)' }} />}
            <div style={{ position: 'absolute', inset: 0, clipPath: leftHalfVisible || portrait ? 'none' : `inset(0 0 0 ${w}px)` }}>
              <ReaderSlot reader={reader} album={album} w={w} h={h} portrait={portrait} interactive={phase === 'open'} onLabel={setLabel} />
            </div>
            {coverMounted && <HingedCover phase={phase} album={album} w={w} h={h} portrait={portrait} />}
          </motion.div>
        )}
      </div>

      {/* navegação nas extremidades */}
      {phase === 'open' && (
        <>
          <EdgeZone side="left" onClick={() => reader.current?.prev()} />
          <EdgeZone side="right" onClick={() => reader.current?.next()} />
        </>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'max(18px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minHeight: 64, justifyContent: 'flex-end' }}>
        <AnimatePresence mode="wait">
          {phase === 'resting' && (
            <motion.button key="open" className="om-btn" type="button" onClick={openBook}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, delay: fromReveal ? 0.3 : 0 }}>
              Abrir nosso livro
            </motion.button>
          )}
          {phase === 'open' && (
            <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <span className="om-hand" style={{ color: 'rgba(232,221,200,.7)', fontSize: 15, minWidth: 90, textAlign: 'center' }}>{label}</span>
              <button type="button" className="om-link" onClick={closeBook}>fechar o livro</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: 'absolute', right: 14, top: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
        {isDemo && <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(232,221,200,.5)' }}>conteúdo de demonstração</span>}
        <a href="#/admin" className="om-link" style={{ textDecoration: 'none', fontSize: '.85rem' }}>administração</a>
      </div>
    </motion.div>
  )
}

function EdgeZone({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={side === 'left' ? 'Página anterior' : 'Próxima página'}
      style={{ position: 'absolute', top: 0, bottom: 90, [side]: 0, width: 'clamp(28px, 4vw, 64px)', background: 'transparent', border: 0, zIndex: 20, cursor: side === 'left' ? 'w-resize' : 'e-resize' }}
    />
  )
}

function ReaderSlot({ reader, album, w, h, portrait, interactive, onLabel }: {
  reader: React.MutableRefObject<ReaderHandle | null>; album: Album; w: number; h: number; portrait: boolean; interactive: boolean; onLabel: (s: string) => void
}) {
  return <BookReader ref={reader} album={album} w={w} h={h} portrait={portrait} interactive={interactive} onSpreadChange={onLabel} />
}

/** Capa que gira na lombada, com frente (capa) e verso (guarda interna). */
function HingedCover({ phase, album, w, h, portrait }: { phase: Phase; album: Album; w: number; h: number; portrait: boolean }) {
  const reduce = useReducedMotion()
  const angle = useMotionValue(phase === 'closing' ? -180 : 0)
  const shade = useTransform(angle, [0, -90, -180], [0, 0.4, 0])
  const target = phase === 'closing' ? 0 : -180

  useEffect(() => {
    if (reduce) { angle.set(target); return }
    const start = angle.get()
    const t0 = performance.now()
    const dur = OPEN_MS
    let raf = 0
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      angle.set(start + (target - start) * ease(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [angle, reduce, target])

  return (
    <motion.div
      style={{
        position: 'absolute', top: 0, left: portrait ? 0 : w, width: w, height: h, transformOrigin: 'left center',
        transformStyle: 'preserve-3d', rotateY: angle, zIndex: 30,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
        <CoverArt settings={album.settings} w={w} h={h} />
        <motion.div style={{ position: 'absolute', inset: 0, background: '#000', opacity: shade }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <EndpaperFace settings={album.settings} />
        <motion.div style={{ position: 'absolute', inset: 0, background: '#000', opacity: shade }} />
      </div>
    </motion.div>
  )
}

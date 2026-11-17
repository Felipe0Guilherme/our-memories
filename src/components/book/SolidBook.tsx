import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { AlbumSettings } from '../../types/album'
import { CoverArt } from './CoverArt'

interface Props {
  settings: AlbumSettings
  w: number
  h: number
  /** Valores iniciais/alvo controlados pelo pai (rotateY para mostrar a lombada). */
  initialRotateY?: number
  animateRotateY?: number
  rotateDuration?: number
}

/** Livro fechado como objeto 3D: capa, contracapa, lombada e bloco de páginas. */
export const SolidBook = forwardRef<HTMLDivElement, Props>(function SolidBook(
  { settings, w, h, initialRotateY = 18, animateRotateY, rotateDuration = 0.55 }, ref,
) {
  const d = Math.round(w * 0.085) // espessura
  const pageInset = 3
  const face: React.CSSProperties = { position: 'absolute', backfaceVisibility: 'hidden' }

  return (
    <motion.div
      ref={ref}
      initial={{ rotateY: initialRotateY }}
      animate={animateRotateY === undefined ? undefined : { rotateY: animateRotateY }}
      transition={{ duration: rotateDuration, ease: [0.45, 0, 0.2, 1] }}
      style={{ width: w, height: h, position: 'relative', transformStyle: 'preserve-3d' }}
    >
      {/* sombra projetada sobre a mesa */}
      <div style={{ ...face, inset: 0, transform: `translateZ(${-d / 2 - 2}px)`, boxShadow: '0 36px 60px -8px rgba(0,0,0,.65), 0 8px 18px rgba(0,0,0,.4)', backfaceVisibility: 'visible' }} />
      {/* contracapa */}
      <div style={{ ...face, inset: 0, background: '#3e2f27', transform: `translateZ(${-d / 2}px) rotateY(180deg)` }} />
      {/* bloco de páginas: borda direita, topo e base */}
      <div style={{ ...face, top: pageInset, bottom: pageInset, left: w - d / 2, width: d, backgroundImage: 'var(--pages-edge)', transform: 'rotateY(90deg)' }} />
      <div style={{ ...face, left: pageInset, right: 0, top: -d / 2, height: d, backgroundColor: '#E8DDC8', transform: 'rotateX(90deg)' }} />
      <div style={{ ...face, left: pageInset, right: 0, bottom: -d / 2, height: d, backgroundColor: '#DCCFB6', transform: 'rotateX(-90deg)' }} />
      {/* lombada */}
      <div style={{ ...face, top: 0, bottom: 0, left: -d / 2, width: d, background: '#3a2c24', transform: 'rotateY(-90deg)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--cloth)', backgroundSize: '260px 260px', opacity: 0.6 }} />
        {[0.12, 0.2, 0.8, 0.88].map((p) => (
          <div key={p} style={{ position: 'absolute', left: 0, right: 0, top: `${p * 100}%`, height: 2, background: 'rgba(232,221,200,.28)' }} />
        ))}
      </div>
      {/* capa (frente) */}
      <div style={{ ...face, inset: 0, transform: `translateZ(${d / 2}px)`, boxShadow: '0 0 0 1px rgba(0,0,0,.35)' }}>
        <CoverArt settings={settings} w={w} h={h} />
      </div>
    </motion.div>
  )
})

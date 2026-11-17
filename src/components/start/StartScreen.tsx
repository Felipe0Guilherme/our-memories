import { motion, useReducedMotion } from 'framer-motion'
import type { AlbumSettings } from '../../types/album'

interface Props { settings: AlbumSettings; onStart: () => void; leaving: boolean }

/** Tela inicial: sóbria, em tom escuro, com entrada lenta de cada elemento. */
export function StartScreen({ settings, onStart, leaving }: Props) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 } as const,
    animate: { opacity: leaving ? 0 : 1, y: leaving ? -6 : 0 },
    transition: { duration: leaving ? 0.9 : 1.6, delay: leaving ? 0 : delay, ease: [0.22, 0.7, 0.2, 1] as [number, number, number, number] },
  })

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#292522', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '220px', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 640 }}>
        <motion.div {...rise(0.3)} style={{ width: 56, height: 1, background: 'rgba(232,221,200,.45)', margin: '0 auto 34px' }} />
        <motion.h1 {...rise(0.6)} style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(2.8rem, 9vw, 5.6rem)', letterSpacing: '.06em', lineHeight: 1.02, color: '#E8DDC8' }}>
          {settings.title}
        </motion.h1>
        <motion.p {...rise(1.2)} style={{ margin: '26px auto 0', fontStyle: 'italic', fontSize: 'clamp(1.05rem, 2.6vw, 1.35rem)', lineHeight: 1.6, color: '#B8A88F', maxWidth: 440 }}>
          {settings.tagline}
        </motion.p>
        <motion.div {...rise(2.0)} style={{ marginTop: 52 }}>
          <button type="button" className="om-btn" onClick={onStart} disabled={leaving}>Começar nossa história</button>
        </motion.div>
      </div>
    </div>
  )
}

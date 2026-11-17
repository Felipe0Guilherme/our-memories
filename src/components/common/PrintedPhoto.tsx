import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Photo } from '../../types/album'
import { clamp, formatDate } from '../../lib/format'

interface Props {
  photo: Photo
  rotate?: number
  /** Só carrega a imagem quando a página está perto de ser vista (lazy loading real). */
  nearby: boolean
  fixedAspect?: number
  tape?: 'tape' | 'corners' | 'none'
  showCaption?: boolean
  delay?: number
  className?: string
  style?: React.CSSProperties
}

/** Fotografia com aparência de impressão colada no álbum. */
export function PrintedPhoto({ photo, rotate = 0, nearby, fixedAspect, tape = 'none', showCaption = false, delay = 0, className, style }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const reduce = useReducedMotion()
  const natural = photo.width && photo.height ? photo.width / photo.height : 1.33
  const aspect = fixedAspect ?? clamp(natural, 0.72, 1.6)

  return (
    <motion.figure
      className={className}
      style={{ margin: 0, ...style }}
      initial={reduce ? false : { opacity: 0, y: 8, rotate: rotate - 1.5 }}
      animate={nearby ? { opacity: 1, y: 0, rotate } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.7, 0.2, 1] }}
      whileHover={reduce ? undefined : { y: -2, rotate: rotate * 0.6, transition: { duration: 0.35 } }}
    >
      <div
        style={{
          position: 'relative', background: '#F8F4EA', padding: '2.4cqw 2.4cqw 2.4cqw',
          boxShadow: '0 1px 1px rgba(41,37,34,.28), 0 8px 16px -8px rgba(41,37,34,.5)',
          outline: '1px solid rgba(73,56,47,.12)',
        }}
      >
        <div style={{ position: 'relative', aspectRatio: String(aspect), background: '#E8DDC8', overflow: 'hidden' }}>
          {!loaded && !failed && (
            <div className="om-developing" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#DDD0B8' }}>
              <span className="om-hand" style={{ fontSize: '3.2cqw', color: '#8B7562' }}>revelando…</span>
            </div>
          )}
          {failed && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#DDD0B8', textAlign: 'center', padding: '4cqw' }}>
              <span className="om-hand" style={{ fontSize: '3cqw', color: '#8B7562' }}>não foi possível abrir esta foto</span>
            </div>
          )}
          {nearby && (
            <img
              src={photo.url} alt={photo.caption || 'Fotografia do álbum'} loading="lazy" decoding="async" draggable={false}
              onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                filter: loaded ? 'sepia(.1) contrast(.97) saturate(.95)' : 'sepia(1) blur(6px)',
                opacity: loaded ? 1 : 0, transition: reduce ? 'none' : 'opacity .9s ease, filter 1.2s ease',
              }}
            />
          )}
        </div>
        {tape === 'tape' && (
          <>
            <span style={{ position: 'absolute', top: '-2.2cqw', left: '12%', width: '14cqw', height: '4.4cqw', background: 'rgba(222,208,178,.82)', transform: 'rotate(-6deg)', boxShadow: '0 1px 1px rgba(41,37,34,.15)' }} />
            <span style={{ position: 'absolute', top: '-2.2cqw', right: '10%', width: '14cqw', height: '4.4cqw', background: 'rgba(222,208,178,.82)', transform: 'rotate(5deg)', boxShadow: '0 1px 1px rgba(41,37,34,.15)' }} />
          </>
        )}
        {tape === 'corners' && (
          <>
            {[
              { top: 0, left: 0, clip: 'polygon(0 0, 100% 0, 0 100%)' },
              { top: 0, right: 0, clip: 'polygon(0 0, 100% 0, 100% 100%)' },
              { bottom: 0, left: 0, clip: 'polygon(0 0, 100% 100%, 0 100%)' },
              { bottom: 0, right: 0, clip: 'polygon(100% 0, 100% 100%, 0 100%)' },
            ].map((c, i) => (
              <span key={i} style={{ position: 'absolute', width: '7cqw', height: '7cqw', background: '#49382F', clipPath: c.clip, top: c.top, left: c.left, right: c.right, bottom: c.bottom } as React.CSSProperties} />
            ))}
          </>
        )}
      </div>
      {showCaption && (photo.caption || photo.takenOn) && (
        <figcaption style={{ textAlign: 'center', marginTop: '2.6cqw' }}>
          {photo.caption && <div className="om-hand" style={{ fontSize: '4.2cqw', lineHeight: 1.35, color: '#49382F' }}>{photo.caption}</div>}
          {photo.takenOn && <div style={{ fontSize: '2.9cqw', letterSpacing: '.16em', textTransform: 'uppercase', color: '#8B7562', marginTop: '.6cqw' }}>{formatDate(photo.takenOn)}</div>}
        </figcaption>
      )}
    </motion.figure>
  )
}

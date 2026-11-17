import type { AlbumSettings } from '../../types/album'

interface Props { settings: AlbumSettings; w: number; h: number }

/** Frente da capa: tecido, título em relevo, etiqueta de papel para data/dedicatória. */
export function CoverArt({ settings, w, h }: Props) {
  const u = w / 100
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#49382F', overflow: 'hidden', borderRadius: '2px 6px 6px 2px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--cloth)', backgroundSize: '260px 260px', opacity: 0.55 }} />
      {/* vinco da dobradiça */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 5.5 * u, width: 1, background: 'rgba(0,0,0,.38)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 5.5 * u + 1, width: 1, background: 'rgba(232,221,200,.08)' }} />
      {/* moldura em baixo-relevo */}
      <div style={{ position: 'absolute', top: 7 * u, bottom: 7 * u, left: 11 * u, right: 7 * u, border: '1px solid rgba(232,221,200,.28)' }} />
      <div style={{ position: 'absolute', top: 8.6 * u, bottom: 8.6 * u, left: 12.6 * u, right: 8.6 * u, border: '1px solid rgba(232,221,200,.14)' }} />
      <div style={{ position: 'absolute', left: 11 * u, right: 7 * u, top: h * 0.3, textAlign: 'center' }}>
        <div style={{ width: 8 * u, height: 1, background: 'rgba(232,221,200,.5)', margin: `0 auto ${3 * u}px` }} />
        <div style={{
          fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: Math.max(22, 9.2 * u), lineHeight: 1.04, letterSpacing: '.07em',
          color: '#E8DDC8', textShadow: '0 -1px 0 rgba(0,0,0,.55), 0 1px 0 rgba(232,221,200,.16)', padding: `0 ${2 * u}px`,
        }}>
          {settings.title}
        </div>
        <div style={{ width: 8 * u, height: 1, background: 'rgba(232,221,200,.5)', margin: `${3 * u}px auto 0` }} />
      </div>
      {/* etiqueta de papel */}
      <div style={{
        position: 'absolute', left: 25 * u, right: 21 * u, bottom: 14 * u, minHeight: 9 * u, background: '#E8DDC8',
        boxShadow: '0 1px 1px rgba(0,0,0,.5), 0 3px 6px -2px rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', padding: `${1.4 * u}px ${2 * u}px`,
      }}>
        <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(73,56,47,.28)' }} />
        {settings.coverNote ? (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: Math.max(11, 3.9 * u), color: '#49382F', textAlign: 'center', lineHeight: 1.3 }}>{settings.coverNote}</span>
        ) : (
          <span style={{ width: '60%', borderBottom: '1px solid rgba(73,56,47,.4)', height: 14 }} />
        )}
      </div>
    </div>
  )
}

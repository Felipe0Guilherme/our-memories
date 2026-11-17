import type { AlbumSettings } from '../../types/album'

/** Guarda interna da capa (também usada como verso da capa que abre). */
export function EndpaperContent({ settings }: { settings: AlbumSettings }) {
  return (
    <>
        <div style={{ position: 'absolute', inset: '9cqw', border: '1px solid rgba(139,117,98,.3)' }} />
        <div style={{ position: 'absolute', left: '22cqw', right: '22cqw', top: '38cqw', padding: '6cqw 3cqw', textAlign: 'center', background: '#E8DDC8', boxShadow: '0 1px 1px rgba(41,37,34,.3), 0 5px 10px -6px rgba(41,37,34,.45)' }}>
          <div style={{ position: 'absolute', inset: '1.2cqw', border: '1px solid rgba(73,56,47,.28)' }} />
          <div style={{ fontSize: '2.6cqw', letterSpacing: '.3em', textTransform: 'uppercase', color: '#8B7562' }}>álbum</div>
          <div style={{ fontSize: '6cqw', lineHeight: 1.1, marginTop: '2cqw', color: '#49382F', fontWeight: 500 }}>{settings.title}</div>
        </div>
    </>
  )
}

/** Versão autônoma, usada como verso da capa que se abre. */
export function EndpaperFace({ settings }: { settings: AlbumSettings }) {
  return (
    <div className="om-page om-page--left">
      <div className="om-page__inner"><EndpaperContent settings={settings} /></div>
    </div>
  )
}

import type { ReactNode } from 'react'
import type { AlbumPage } from '../../types/album'
import { PrintedPhoto } from '../common/PrintedPhoto'
import { useBookActions } from './BookActions'

interface LayoutProps { page: AlbumPage; nearby: boolean }

const DemoStamp = () => (
  <div style={{ position: 'absolute', top: '1.8cqw', left: '50%', transform: 'translateX(-50%)', zIndex: 6, fontSize: '2.3cqw', letterSpacing: '.22em', textTransform: 'uppercase', color: '#8B7562', border: '1px solid rgba(139,117,98,.5)', padding: '.6cqw 1.6cqw' }}>
    demonstração
  </div>
)

function Frame({ page, children }: { page: AlbumPage; children: ReactNode }) {
  return <>{page.isDemo && <DemoStamp />}{children}</>
}

function Flourish() {
  return (
    <svg viewBox="0 0 120 12" style={{ width: '22cqw', display: 'block', margin: '0 auto' }} aria-hidden>
      <line x1="0" y1="6" x2="48" y2="6" stroke="#8B7562" strokeWidth=".7" />
      <rect x="57" y="3" width="6" height="6" transform="rotate(45 60 6)" fill="none" stroke="#8B7562" strokeWidth=".8" />
      <line x1="72" y1="6" x2="120" y2="6" stroke="#8B7562" strokeWidth=".7" />
    </svg>
  )
}

/* ------------------------------------------------------------------ dedicatória */
export function DedicationLayout({ page }: LayoutProps) {
  return (
    <Frame page={page}>
      <div style={{ position: 'absolute', inset: '7cqw', border: '1px solid rgba(139,117,98,.35)' }} />
      <div style={{ position: 'absolute', inset: '9cqw', border: '1px solid rgba(139,117,98,.2)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16cqw 17cqw', textAlign: 'center', gap: '6cqw' }}>
        {page.title && <h2 style={{ margin: 0, fontWeight: 500, fontSize: '5.2cqw', letterSpacing: '.28em', textTransform: 'uppercase', color: '#49382F' }}>{page.title}</h2>}
        <Flourish />
        <p className="om-hand om-pre" style={{ margin: 0, fontSize: page.body.length > 220 ? '4.6cqw' : '5.8cqw', lineHeight: 1.95, color: '#49382F' }}>{page.body}</p>
        <Flourish />
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ foto única */
export function PhotoLayout({ page, nearby }: LayoutProps) {
  const p = page.photos[0]
  return (
    <Frame page={page}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 11cqw' }}>
        {p ? <PrintedPhoto photo={p} nearby={nearby} rotate={-1.2} tape="tape" showCaption delay={0.1} fixedAspect={p.height && p.width && p.height > p.width ? 0.85 : 1.18} /> : <EmptySlot />}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ duas fotos */
export function DuoLayout({ page, nearby }: LayoutProps) {
  const [a, b] = page.photos
  return (
    <Frame page={page}>
      {a && <PrintedPhoto photo={a} nearby={nearby} rotate={-3} tape="corners" showCaption delay={0.05} fixedAspect={0.95} style={{ position: 'absolute', left: '7cqw', top: '8cqw', width: '50cqw' }} />}
      {b && <PrintedPhoto photo={b} nearby={nearby} rotate={2.6} tape="tape" showCaption delay={0.25} fixedAspect={1.35} style={{ position: 'absolute', right: '6cqw', top: '78cqw', width: '56cqw' }} />}
      {!a && !b && <EmptySlot />}
    </Frame>
  )
}

/* ------------------------------------------------------------------ colagem */
const SLOTS = [
  { l: 8, t: 8, w: 56, a: 1.35, r: -3, k: 'tape' },
  { l: 44, t: 30, w: 44, a: 0.8, r: 3.5, k: 'corners' },
  { l: 10, t: 62, w: 46, a: 1.2, r: -2, k: 'tape' },
  { l: 52, t: 62, w: 38, a: 1, r: 2.5, k: 'corners' },
  { l: 8, t: 88, w: 40, a: 1.3, r: 3, k: 'tape' },
  { l: 54, t: 96, w: 34, a: 1.2, r: -4, k: 'corners' },
] as const

export function CollageLayout({ page, nearby }: LayoutProps) {
  const photos = page.photos.slice(0, 6)
  return (
    <Frame page={page}>
      {photos.map((p, i) => {
        const s = SLOTS[i]
        return (
          <PrintedPhoto key={p.id} photo={p} nearby={nearby} rotate={s.r} tape={s.k} fixedAspect={s.a} delay={0.08 * i}
            style={{ position: 'absolute', left: `${s.l}cqw`, top: `${s.t}cqw`, width: `${s.w}cqw`, zIndex: i }} />
        )
      })}
      {photos.length === 0 && <EmptySlot />}
      {page.title && (
        <div className="om-hand" style={{ position: 'absolute', bottom: '4cqw', left: 0, right: 0, textAlign: 'center', fontSize: '4cqw', color: '#49382F', zIndex: 10 }}>{page.title}</div>
      )}
    </Frame>
  )
}

/* ------------------------------------------------------------------ mensagem */
export function MessageLayout({ page }: LayoutProps) {
  const len = page.body.length
  const size = len > 650 ? 3.35 : len > 420 ? 3.8 : 4.4
  return (
    <Frame page={page}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '12cqw', borderLeft: '1px solid rgba(160,90,70,.28)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: '13cqw 9cqw 11cqw 17cqw', display: 'flex', flexDirection: 'column' }}>
        {page.title && <div className="om-hand" style={{ fontSize: '4.2cqw', color: '#8B7562', marginBottom: '5cqw' }}>{page.title}</div>}
        <p className="om-pre" style={{ margin: 0, fontStyle: 'italic', fontSize: `${size}cqw`, lineHeight: 1.62, color: '#3b2e26', overflow: 'hidden' }}>{page.body}</p>
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ encerramento */
export function ClosingLayout({ page, nearby }: LayoutProps) {
  const { restart } = useBookActions()
  const p = page.photos[0]
  return (
    <Frame page={page}>
      <div style={{ position: 'absolute', inset: 0, padding: '10cqw 11cqw 8cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4.5cqw' }}>
        {page.title && <h2 style={{ margin: 0, fontWeight: 500, fontSize: '5cqw', letterSpacing: '.26em', textTransform: 'uppercase', textAlign: 'center' }}>{page.title}</h2>}
        {p && <PrintedPhoto photo={p} nearby={nearby} rotate={1.4} tape="tape" showCaption fixedAspect={1.25} style={{ width: '72cqw' }} />}
        {page.body && <p className="om-hand om-pre" style={{ margin: 0, fontSize: '4.6cqw', lineHeight: 1.8, textAlign: 'center', color: '#49382F' }}>{page.body}</p>}
        <button type="button" onClick={restart}
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid rgba(73,56,47,.5)', color: '#49382F', padding: '2cqw 5.5cqw', fontFamily: 'inherit', fontSize: '3cqw', letterSpacing: '.22em', textTransform: 'uppercase' }}>
          Voltar ao início
        </button>
      </div>
    </Frame>
  )
}

function EmptySlot() {
  return (
    <div style={{ position: 'absolute', inset: '14cqw', border: '1px dashed rgba(139,117,98,.5)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <span className="om-hand" style={{ fontSize: '4cqw', color: '#8B7562' }}>nenhuma fotografia nesta página ainda</span>
    </div>
  )
}

export function renderLayout(page: AlbumPage, nearby: boolean) {
  const props = { page, nearby }
  switch (page.layout) {
    case 'dedication': return <DedicationLayout {...props} />
    case 'photo': return <PhotoLayout {...props} />
    case 'duo': return <DuoLayout {...props} />
    case 'collage': return <CollageLayout {...props} />
    case 'message': return <MessageLayout {...props} />
    case 'closing': return <ClosingLayout {...props} />
  }
}

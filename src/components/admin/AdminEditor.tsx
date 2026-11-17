import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, LAYOUTS, MAX_BODY_CHARS, type Album, type AlbumPage, type AlbumSettings, type PageLayout } from '../../types/album'
import * as svc from '../../services/albumService'
import { PhotoUploader } from './PhotoUploader'

const card: React.CSSProperties = { background: '#F5F0E6', border: '1px solid #cfc2a8', borderRadius: 4, padding: 16 }

export function AdminEditor() {
  const [album, setAlbum] = useState<Album | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    try {
      const a = await svc.fetchAlbum()
      setAlbum(a); setLoadError(null)
      setSelectedId((cur) => (cur && a.pages.some((p) => p.id === cur) ? cur : a.pages[0]?.id ?? null))
    } catch (e) { setLoadError(e instanceof Error ? e.message : 'Erro ao carregar.') }
  }, [])
  useEffect(() => { void reload() }, [reload])

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true); setNotice(null)
    try { await fn(); await reload(); setNotice({ kind: 'ok', text: label }) }
    catch (e) { setNotice({ kind: 'err', text: e instanceof Error ? e.message : 'Algo deu errado.' }) }
    finally { setBusy(false) }
  }

  if (loadError) return <div role="alert" style={{ color: '#8a3a2e' }}>Não foi possível carregar: {loadError}. Confirme se o SQL de configuração foi executado. <button className="ad-btn" onClick={() => void reload()}>Tentar de novo</button></div>
  if (!album) return <p>Carregando álbum…</p>

  const page = album.pages.find((p) => p.id === selectedId) ?? null
  const move = (id: string, dir: -1 | 1) => {
    const ids = album.pages.map((p) => p.id)
    const i = ids.indexOf(id), j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    void run('Ordem das páginas salva.', () => svc.reorderPages(ids))
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {notice && (
        <div role={notice.kind === 'err' ? 'alert' : 'status'} style={{ padding: '10px 14px', borderRadius: 3, background: notice.kind === 'err' ? '#f0d3cc' : '#d9e4cf', color: '#292522' }}>{notice.text}</div>
      )}
      <SettingsCard settings={album.settings} busy={busy} onSave={(s) => run('Configurações salvas.', () => svc.saveSettings(s))} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 18, alignItems: 'start' }} className="ad-grid">
        <aside style={card}>
          <h2 style={{ marginTop: 0, fontWeight: 600, fontSize: '1.1rem' }}>Páginas ({album.pages.length})</h2>
          {album.pages.length === 0 && <p style={{ color: '#6b5a4c' }}>O álbum ainda não tem páginas. Enquanto isso, os visitantes veem páginas de demonstração. Crie a primeira abaixo.</p>}
          <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'grid', gap: 6 }}>
            {album.pages.map((p, i) => (
              <li key={p.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => setSelectedId(p.id)} className="ad-btn ad-btn--ghost" style={{ flex: 1, textAlign: 'left', background: p.id === selectedId ? '#e3d8c2' : 'transparent' }}>
                  {i + 1}. {LAYOUTS[p.layout].label}{p.photos.length ? ` · ${p.photos.length} foto${p.photos.length > 1 ? 's' : ''}` : ''}
                </button>
                <button className="ad-btn ad-btn--ghost" disabled={busy || i === 0} onClick={() => move(p.id, -1)} aria-label="Subir página">↑</button>
                <button className="ad-btn ad-btn--ghost" disabled={busy || i === album.pages.length - 1} onClick={() => move(p.id, 1)} aria-label="Descer página">↓</button>
              </li>
            ))}
          </ol>
          <NewPage busy={busy} onCreate={(layout) => run('Página criada.', async () => {
            const id = await svc.createPage(layout, album.pages.length + 1)
            setSelectedId(id)
          })} />
        </aside>

        <section style={card}>
          {page ? (
            <PageEditor key={page.id} page={page} busy={busy}
              onSave={(patch) => run('Página salva.', () => svc.updatePage(page.id, patch))}
              onDelete={() => { if (confirm('Excluir esta página e todas as fotografias dela? Isso não pode ser desfeito.')) void run('Página excluída.', () => svc.deletePage(page)) }}
              onChanged={reload}
              run={run}
            />
          ) : <p>Selecione ou crie uma página.</p>}
        </section>
      </div>
      <style>{`@media (max-width: 820px){ .ad-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function SettingsCard({ settings, busy, onSave }: { settings: AlbumSettings; busy: boolean; onSave: (s: AlbumSettings) => void }) {
  const [s, setS] = useState<AlbumSettings>(settings ?? DEFAULT_SETTINGS)
  return (
    <section style={card}>
      <h2 style={{ marginTop: 0, fontWeight: 600, fontSize: '1.1rem' }}>Capa e tela inicial</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <label>Título do álbum<input className="ad-input" maxLength={40} value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /></label>
        <label>Frase da tela inicial<input className="ad-input" maxLength={120} value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></label>
        <label>Data ou dedicatória na capa<input className="ad-input" maxLength={36} placeholder="ex.: desde 14 de fevereiro de 2021" value={s.coverNote} onChange={(e) => setS({ ...s, coverNote: e.target.value })} /></label>
      </div>
      <div style={{ marginTop: 12 }}><button className="ad-btn" disabled={busy || !s.title.trim()} onClick={() => onSave({ ...s, title: s.title.trim() })}>Salvar capa</button></div>
    </section>
  )
}

function NewPage({ busy, onCreate }: { busy: boolean; onCreate: (l: PageLayout) => void }) {
  const [layout, setLayout] = useState<PageLayout>('photo')
  return (
    <div style={{ display: 'grid', gap: 8, borderTop: '1px solid #cfc2a8', paddingTop: 12 }}>
      <label>Nova página
        <select className="ad-input" value={layout} onChange={(e) => setLayout(e.target.value as PageLayout)}>
          {(Object.keys(LAYOUTS) as PageLayout[]).map((l) => <option key={l} value={l}>{LAYOUTS[l].label}</option>)}
        </select>
      </label>
      <button className="ad-btn" disabled={busy} onClick={() => onCreate(layout)}>Criar página</button>
    </div>
  )
}

interface PageEditorProps {
  page: AlbumPage; busy: boolean
  onSave: (patch: { layout: PageLayout; title: string; body: string }) => void
  onDelete: () => void
  onChanged: () => Promise<void>
  run: (label: string, fn: () => Promise<void>) => Promise<void>
}

function PageEditor({ page, busy, onSave, onDelete, onChanged, run }: PageEditorProps) {
  const [layout, setLayout] = useState<PageLayout>(page.layout)
  const [title, setTitle] = useState(page.title)
  const [body, setBody] = useState(page.body)
  const def = LAYOUTS[layout]
  const tooMany = page.photos.length > def.maxPhotos
  const dirty = layout !== page.layout || title !== page.title || body !== page.body

  const movePhoto = (id: string, dir: -1 | 1) => {
    const ids = page.photos.map((p) => p.id)
    const i = ids.indexOf(id), j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    void run('Ordem das fotografias salva.', () => svc.reorderPhotos(ids))
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Editar página</h2>
        <button className="ad-btn ad-btn--danger" disabled={busy} onClick={onDelete}>Excluir página</button>
      </div>

      <label>Modelo de composição
        <select className="ad-input" value={layout} onChange={(e) => setLayout(e.target.value as PageLayout)}>
          {(Object.keys(LAYOUTS) as PageLayout[]).map((l) => <option key={l} value={l}>{LAYOUTS[l].label}</option>)}
        </select>
        <small style={{ color: '#6b5a4c' }}>{def.hint} Máx. de fotografias: {def.maxPhotos}.</small>
      </label>
      {tooMany && <div role="alert" style={{ color: '#8a3a2e' }}>Este modelo comporta {def.maxPhotos} foto(s), mas a página tem {page.photos.length}. Remova fotografias antes de salvar.</div>}

      {(def.usesText || layout === 'dedication') && (
        <>
          <label>{layout === 'collage' ? 'Anotação (aparece no rodapé da colagem)' : 'Título'}
            <input className="ad-input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          {layout !== 'collage' && (
            <label>Texto
              <textarea className="ad-input" rows={9} maxLength={MAX_BODY_CHARS} value={body} onChange={(e) => setBody(e.target.value)} />
              <small style={{ color: '#6b5a4c' }}>{body.length}/{MAX_BODY_CHARS}. Quebras de linha são mantidas.</small>
            </label>
          )}
        </>
      )}
      <div><button className="ad-btn" disabled={busy || !dirty || tooMany} onClick={() => onSave({ layout, title, body })}>Salvar página</button></div>

      <hr style={{ border: 0, borderTop: '1px solid #cfc2a8', width: '100%' }} />
      <h3 style={{ margin: 0, fontWeight: 600 }}>Fotografias ({page.photos.length}/{page.layout === layout ? def.maxPhotos : LAYOUTS[page.layout].maxPhotos})</h3>

      {page.photos.length === 0 && LAYOUTS[page.layout].maxPhotos > 0 && <p style={{ color: '#6b5a4c', margin: 0 }}>Nenhuma fotografia nesta página.</p>}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
        {page.photos.map((ph, i) => (
          <li key={ph.id} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 12, alignItems: 'start', border: '1px solid #d8ccb4', padding: 10, background: '#fbf8f0' }}>
            <img src={ph.url} alt="" loading="lazy" style={{ width: 84, height: 84, objectFit: 'cover', background: '#E8DDC8' }} />
            <PhotoRow key={ph.id + ph.caption + ph.takenOn} photo={ph} busy={busy}
              first={i === 0} last={i === page.photos.length - 1}
              onMove={(d) => movePhoto(ph.id, d)}
              onSave={(caption, takenOn) => run('Fotografia atualizada.', () => svc.updatePhoto(ph.id, { caption, takenOn }))}
              onDelete={() => { if (confirm('Excluir esta fotografia do álbum e do armazenamento?')) void run('Fotografia excluída.', () => svc.deletePhoto(ph)) }} />
          </li>
        ))}
      </ul>

      <PhotoUploader pageId={page.id} existing={page.photos.length} max={LAYOUTS[page.layout].maxPhotos} onUploaded={onChanged} />
    </div>
  )
}

function PhotoRow({ photo, busy, first, last, onMove, onSave, onDelete }: {
  photo: AlbumPage['photos'][number]; busy: boolean; first: boolean; last: boolean
  onMove: (d: -1 | 1) => void; onSave: (caption: string, takenOn: string | null) => void; onDelete: () => void
}) {
  const [caption, setCaption] = useState(photo.caption)
  const [date, setDate] = useState(photo.takenOn ?? '')
  const dirty = caption !== photo.caption || date !== (photo.takenOn ?? '')
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <input className="ad-input" placeholder="Legenda" maxLength={140} value={caption} onChange={(e) => setCaption(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="ad-input" type="date" style={{ width: 170 }} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Data da fotografia" />
        <button className="ad-btn" disabled={busy || !dirty} onClick={() => onSave(caption, date || null)}>Salvar</button>
        <button className="ad-btn ad-btn--ghost" disabled={busy || first} onClick={() => onMove(-1)} aria-label="Mover para antes">↑</button>
        <button className="ad-btn ad-btn--ghost" disabled={busy || last} onClick={() => onMove(1)} aria-label="Mover para depois">↓</button>
        <button className="ad-btn ad-btn--danger" disabled={busy} onClick={onDelete}>Excluir</button>
      </div>
    </div>
  )
}

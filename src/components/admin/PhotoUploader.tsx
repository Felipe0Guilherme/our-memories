import { useEffect, useRef, useState } from 'react'
import { ACCEPTED_TYPES, MAX_ORIGINAL_MB, uploadPhoto, validateImage } from '../../services/uploadService'

interface Staged {
  key: string; file: File; preview: string; caption: string; takenOn: string
  status: 'pronta' | 'enviando' | 'concluida' | 'erro'; stage: 'otimizando' | 'enviando'; progress: number; error?: string
}

interface Props { pageId: string; existing: number; max: number; onUploaded: () => Promise<void> }

export function PhotoUploader({ pageId, existing, max, onUploaded }: Props) {
  const [items, setItems] = useState<Staged[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<Staged[]>([])
  itemsRef.current = items
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), [])

  const pending = items.filter((i) => i.status !== 'concluida')
  const room = max - existing - pending.length

  const patch = (key: string, p: Partial<Staged>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)))

  const pick = (files: FileList | null) => {
    if (!files) return
    const errs: string[] = []
    const added: Staged[] = []
    let slots = room
    Array.from(files).forEach((f) => {
      const err = validateImage(f)
      if (err) { errs.push(err); return }
      if (slots <= 0) { errs.push(`"${f.name}": a página já está cheia para este modelo.`); return }
      slots--
      added.push({ key: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f), caption: '', takenOn: '', status: 'pronta', stage: 'otimizando', progress: 0 })
    })
    setProblems(errs)
    setItems((cur) => [...cur.filter((i) => i.status !== 'concluida'), ...added])
    if (input.current) input.current.value = ''
  }

  const remove = (key: string) => setItems((cur) => {
    const it = cur.find((i) => i.key === key); if (it) URL.revokeObjectURL(it.preview)
    return cur.filter((i) => i.key !== key)
  })

  const publish = async () => {
    setRunning(true)
    let position = existing
    for (const it of itemsRef.current.filter((i) => i.status === 'pronta' || i.status === 'erro')) {
      patch(it.key, { status: 'enviando', error: undefined, progress: 0 })
      try {
        await uploadPhoto(
          { file: it.file, pageId, position, caption: it.caption.trim(), takenOn: it.takenOn || null },
          (progress, stage) => patch(it.key, { progress, stage }),
        )
        patch(it.key, { status: 'concluida', progress: 100 })
        position++
      } catch (e) {
        patch(it.key, { status: 'erro', error: e instanceof Error ? e.message : 'Falha no envio.' })
      }
    }
    setRunning(false)
    await onUploaded()
    setItems((cur) => { cur.filter((i) => i.status === 'concluida').forEach((i) => URL.revokeObjectURL(i.preview)); return cur.filter((i) => i.status !== 'concluida') })
  }

  if (max === 0) return <p style={{ color: '#6b5a4c', margin: 0 }}>Este modelo é só de texto e não recebe fotografias.</p>

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ margin: 0, fontWeight: 600 }}>Adicionar fotografias</h3>
      <input ref={input} type="file" multiple accept={ACCEPTED_TYPES.join(',')} onChange={(e) => pick(e.target.files)} disabled={running || room <= 0} />
      <small style={{ color: '#6b5a4c' }}>JPG, PNG ou WebP, até {MAX_ORIGINAL_MB} MB cada. As imagens são otimizadas (máx. 2000 px) antes do envio. Espaço restante nesta página: {Math.max(room, 0)}.</small>
      {problems.map((p) => <div key={p} role="alert" style={{ color: '#8a3a2e' }}>{p}</div>)}

      {items.length > 0 && (
        <>
          <p style={{ margin: 0, fontWeight: 600 }}>Prévia — nada foi publicado ainda</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {items.map((it) => (
              <li key={it.key} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 12, border: '1px solid #d8ccb4', padding: 10, background: '#fbf8f0' }}>
                <img src={it.preview} alt="" style={{ width: 84, height: 84, objectFit: 'cover' }} />
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 13, color: '#6b5a4c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.file.name} · {(it.file.size / 1048576).toFixed(1)} MB</div>
                  <input className="ad-input" placeholder="Legenda" maxLength={140} value={it.caption} disabled={it.status === 'enviando'} onChange={(e) => patch(it.key, { caption: e.target.value })} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="ad-input" type="date" style={{ width: 170 }} value={it.takenOn} disabled={it.status === 'enviando'} onChange={(e) => patch(it.key, { takenOn: e.target.value })} aria-label="Data" />
                    {it.status !== 'enviando' && it.status !== 'concluida' && <button className="ad-btn ad-btn--ghost" onClick={() => remove(it.key)}>Remover</button>}
                    {it.status === 'enviando' && <span style={{ fontSize: 13 }}>{it.stage === 'otimizando' ? 'Otimizando…' : `Enviando ${it.progress}%`}</span>}
                    {it.status === 'concluida' && <span style={{ fontSize: 13, color: '#3d6b35' }}>Enviada</span>}
                  </div>
                  {it.status === 'enviando' && (
                    <div style={{ height: 6, background: '#d8ccb4' }} role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100}>
                      <div style={{ height: '100%', width: `${it.stage === 'otimizando' ? 4 : it.progress}%`, background: '#49382F', transition: 'width .2s' }} />
                    </div>
                  )}
                  {it.error && <div role="alert" style={{ color: '#8a3a2e', fontSize: 14 }}>{it.error}</div>}
                </div>
              </li>
            ))}
          </ul>
          <div><button className="ad-btn" disabled={running || pending.length === 0} onClick={() => void publish()}>{running ? 'Publicando…' : `Publicar ${pending.length} fotografia${pending.length > 1 ? 's' : ''}`}</button></div>
        </>
      )}
    </div>
  )
}

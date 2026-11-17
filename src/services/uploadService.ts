import imageCompression from 'browser-image-compression'
import { PHOTO_BUCKET, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase'
import { insertPhotoRow, removeStorageObject } from './albumService'

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_ORIGINAL_MB = 25

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.name}": formato não suportado (use JPG, PNG ou WebP).`
  }
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    return `"${file.name}": maior que ${MAX_ORIGINAL_MB} MB.`
  }
  return null
}

function readSize(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { reject(new Error('Não foi possível ler a imagem.')); URL.revokeObjectURL(url) }
    img.src = url
  })
}

/** Reduz para no máx. 2000 px e ~1,2 MB (JPEG), mantendo a orientação correta. */
async function optimize(file: File): Promise<File> {
  const out = await imageCompression(file, {
    maxWidthOrHeight: 2000, maxSizeMB: 1.2, useWebWorker: true, fileType: 'image/jpeg', initialQuality: 0.85,
  })
  return out
}

/** Upload real via XHR para o endpoint do Storage, assim o progresso é verdadeiro. */
function putWithProgress(path: string, blob: Blob, token: string, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${PHOTO_BUCKET}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', supabaseAnonKey!)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.setRequestHeader('Content-Type', blob.type || 'image/jpeg')
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)) }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else {
        let msg = `Falha no envio (${xhr.status}).`
        try { msg = JSON.parse(xhr.responseText).message ?? msg } catch { /* ignore */ }
        reject(new Error(msg))
      }
    }
    xhr.onerror = () => reject(new Error('Sem conexão durante o envio.'))
    xhr.send(blob)
  })
}

export interface UploadInput {
  file: File; pageId: string; position: number; caption: string; takenOn: string | null
}

export async function uploadPhoto(input: UploadInput, onProgress: (pct: number, stage: 'otimizando' | 'enviando') => void) {
  if (!supabase) throw new Error('Supabase não está configurado.')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sessão expirada. Entre novamente.')

  onProgress(0, 'otimizando')
  const optimized = await optimize(input.file)
  const { width, height } = await readSize(optimized)

  const path = `${input.pageId}/${crypto.randomUUID()}.jpg`
  await putWithProgress(path, optimized, token, (p) => onProgress(p, 'enviando'))

  try {
    await insertPhotoRow({
      pageId: input.pageId, position: input.position, fileName: input.file.name, storagePath: path,
      caption: input.caption, takenOn: input.takenOn, width, height,
    })
  } catch (e) {
    await removeStorageObject(path) // não deixa arquivo órfão se o registro falhar
    throw e
  }
}

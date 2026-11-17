import type { Album, AlbumPage, AlbumSettings, PageLayout, Photo } from '../types/album'
import { DEFAULT_SETTINGS } from '../types/album'
import { PHOTO_BUCKET, supabase } from '../lib/supabase'

function sb() {
  if (!supabase) throw new Error('Supabase não está configurado.')
  return supabase
}

interface PhotoRow {
  id: string; page_id: string; position: number; file_name: string; storage_path: string
  caption: string; taken_on: string | null; width: number | null; height: number | null
}
interface PageRow { id: string; position: number; layout: PageLayout; title: string; body: string; photos: PhotoRow[] }

export function publicUrl(path: string) {
  return sb().storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

function mapPhoto(r: PhotoRow): Photo {
  return {
    id: r.id, pageId: r.page_id, position: r.position, fileName: r.file_name, storagePath: r.storage_path,
    url: publicUrl(r.storage_path), caption: r.caption ?? '', takenOn: r.taken_on, width: r.width, height: r.height,
  }
}

export async function fetchAlbum(): Promise<Album> {
  const client = sb()
  const [settingsRes, pagesRes] = await Promise.all([
    client.from('album_settings').select('*').eq('id', 1).maybeSingle(),
    client.from('pages').select('*, photos(*)').order('position', { ascending: true }),
  ])
  if (settingsRes.error) throw new Error(settingsRes.error.message)
  if (pagesRes.error) throw new Error(pagesRes.error.message)

  const s = settingsRes.data
  const settings: AlbumSettings = s
    ? { title: s.title, tagline: s.tagline, coverNote: s.cover_note }
    : { ...DEFAULT_SETTINGS }

  const pages: AlbumPage[] = (pagesRes.data as PageRow[]).map((p) => ({
    id: p.id, position: p.position, layout: p.layout, title: p.title ?? '', body: p.body ?? '',
    photos: (p.photos ?? []).slice().sort((a, b) => a.position - b.position).map(mapPhoto),
  }))
  return { settings, pages }
}

export async function saveSettings(s: AlbumSettings) {
  const { error } = await sb().from('album_settings').upsert({
    id: 1, title: s.title, tagline: s.tagline, cover_note: s.coverNote, updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function createPage(layout: PageLayout, position: number): Promise<string> {
  const { data, error } = await sb().from('pages').insert({ layout, position }).select('id').single()
  if (error) throw new Error(error.message)
  return data.id as string
}

export async function updatePage(id: string, patch: Partial<Pick<AlbumPage, 'layout' | 'title' | 'body'>>) {
  const { error } = await sb().from('pages').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderPages(orderedIds: string[]) {
  const results = await Promise.all(orderedIds.map((id, i) => sb().from('pages').update({ position: i + 1 }).eq('id', id)))
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

/** Remove primeiro os arquivos do Storage e depois a linha (as fotos saem em cascata). */
export async function deletePage(page: AlbumPage) {
  const paths = page.photos.map((p) => p.storagePath)
  if (paths.length) {
    const { error } = await sb().storage.from(PHOTO_BUCKET).remove(paths)
    if (error) throw new Error(`Não foi possível apagar os arquivos: ${error.message}`)
  }
  const { error } = await sb().from('pages').delete().eq('id', page.id)
  if (error) throw new Error(error.message)
}

export async function updatePhoto(id: string, patch: { caption?: string; takenOn?: string | null }) {
  const row: Record<string, unknown> = {}
  if (patch.caption !== undefined) row.caption = patch.caption
  if (patch.takenOn !== undefined) row.taken_on = patch.takenOn
  const { error } = await sb().from('photos').update(row).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderPhotos(orderedIds: string[]) {
  const results = await Promise.all(orderedIds.map((id, i) => sb().from('photos').update({ position: i }).eq('id', id)))
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export async function movePhotoToPage(photoId: string, pageId: string, position: number) {
  const { error } = await sb().from('photos').update({ page_id: pageId, position }).eq('id', photoId)
  if (error) throw new Error(error.message)
}

/** Exclusão sincronizada: arquivo no Storage + linha no banco. */
export async function deletePhoto(photo: Photo) {
  const { error: storageError } = await sb().storage.from(PHOTO_BUCKET).remove([photo.storagePath])
  if (storageError) throw new Error(`Não foi possível apagar o arquivo: ${storageError.message}`)
  const { error } = await sb().from('photos').delete().eq('id', photo.id)
  if (error) throw new Error(error.message)
}

export async function insertPhotoRow(row: {
  pageId: string; position: number; fileName: string; storagePath: string
  caption: string; takenOn: string | null; width: number; height: number
}) {
  const { error } = await sb().from('photos').insert({
    page_id: row.pageId, position: row.position, file_name: row.fileName, storage_path: row.storagePath,
    caption: row.caption, taken_on: row.takenOn, width: row.width, height: row.height,
  })
  if (error) throw new Error(error.message)
}

export async function removeStorageObject(path: string) {
  await sb().storage.from(PHOTO_BUCKET).remove([path])
}

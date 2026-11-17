export type PageLayout = 'dedication' | 'photo' | 'duo' | 'collage' | 'message' | 'closing'

export interface Photo {
  id: string
  pageId: string
  position: number
  fileName: string
  storagePath: string
  url: string
  caption: string
  takenOn: string | null
  width: number | null
  height: number | null
}

export interface AlbumPage {
  id: string
  position: number
  layout: PageLayout
  title: string
  body: string
  photos: Photo[]
  /** Conteúdo de demonstração: nunca persistido. */
  isDemo?: boolean
}

export interface AlbumSettings {
  title: string
  tagline: string
  coverNote: string
}

export interface Album {
  settings: AlbumSettings
  pages: AlbumPage[]
}

export const LAYOUTS: Record<
  PageLayout,
  { label: string; maxPhotos: number; usesText: boolean; hint: string }
> = {
  dedication: { label: 'Dedicatória', maxPhotos: 0, usesText: true, hint: 'Texto centralizado, como uma carta.' },
  photo: { label: 'Fotografia única', maxPhotos: 1, usesText: false, hint: 'Uma fotografia em destaque, com legenda.' },
  duo: { label: 'Duas fotografias', maxPhotos: 2, usesText: false, hint: 'Composição assimétrica com duas fotos.' },
  collage: { label: 'Colagem', maxPhotos: 6, usesText: true, hint: 'De 3 a 6 fotos; o título vira anotação.' },
  message: { label: 'Mensagem', maxPhotos: 0, usesText: true, hint: 'Carta com tipografia de correspondência.' },
  closing: { label: 'Encerramento', maxPhotos: 1, usesText: true, hint: 'Última foto, dedicatória final e retorno ao início.' },
}

export const DEFAULT_SETTINGS: AlbumSettings = {
  title: 'Our Memories',
  tagline: 'Um lugar para guardar o que a gente não quer esquecer.',
  coverNote: '',
}

export const MAX_BODY_CHARS = 900

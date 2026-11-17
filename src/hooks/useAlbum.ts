import { useCallback, useEffect, useState } from 'react'
import type { Album } from '../types/album'
import { DEFAULT_SETTINGS } from '../types/album'
import { buildDemoAlbum } from '../data/demoAlbum'
import { fetchAlbum } from '../services/albumService'
import { isSupabaseConfigured } from '../lib/supabase'

export type AlbumStatus = 'loading' | 'ready' | 'error'

/**
 * Carrega o álbum do Supabase. Só mostra conteúdo de demonstração quando o
 * Supabase não está configurado ou quando ainda não existe nenhuma página salva.
 */
export function useAlbum() {
  const [album, setAlbum] = useState<Album>(() => ({ settings: { ...DEFAULT_SETTINGS }, pages: [] }))
  const [status, setStatus] = useState<AlbumStatus>(isSupabaseConfigured ? 'loading' : 'ready')
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(!isSupabaseConfigured)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAlbum(buildDemoAlbum()); setIsDemo(true); setStatus('ready'); return
    }
    try {
      const real = await fetchAlbum()
      if (real.pages.length === 0) {
        setAlbum({ settings: real.settings, pages: buildDemoAlbum().pages }); setIsDemo(true)
      } else {
        setAlbum(real); setIsDemo(false)
      }
      setError(null); setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar o álbum.')
      setAlbum({ settings: { ...DEFAULT_SETTINGS }, pages: buildDemoAlbum().pages }); setIsDemo(true)
      setStatus('error')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return { album, status, error, isDemo, reload: load }
}

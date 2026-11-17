import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAlbum } from './hooks/useAlbum'
import { useHashRoute } from './hooks/useHashRoute'
import { StartScreen } from './components/start/StartScreen'
import { RevealScene } from './components/scene/RevealScene'
import { BookStage } from './components/book/BookStage'
import { AdminPanel } from './components/admin/AdminPanel'

type Scene = 'start' | 'leaving' | 'reveal' | 'book'

export default function App() {
  const route = useHashRoute()
  const reduce = useReducedMotion()
  const { album, status, error, isDemo, reload } = useAlbum()
  const [scene, setScene] = useState<Scene>('start')

  // Ao voltar da administração, recarrega para refletir o que foi salvo.
  useEffect(() => { if (route === 'album') void reload() }, [route, reload])
  useEffect(() => { document.body.classList.toggle('admin-mode', route === 'admin') }, [route])

  if (route === 'admin') return <AdminPanel />

  const start = () => {
    if (reduce) { setScene('book'); return }
    setScene('leaving')
    window.setTimeout(() => setScene('reveal'), 900)
  }

  return (
    <>
      <AnimatePresence>
        {(scene === 'start' || scene === 'leaving') && (
          <motion.div key="start" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <StartScreen settings={album.settings} onStart={start} leaving={scene === 'leaving'} />
          </motion.div>
        )}
      </AnimatePresence>
      {scene === 'reveal' && <RevealScene settings={album.settings} onDone={() => setScene('book')} />}
      {scene === 'book' && <BookStage album={album} isDemo={isDemo} fromReveal={!reduce} />}
      {status === 'error' && scene !== 'start' && (
        <div role="status" style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 100, maxWidth: 360, fontSize: 13, color: '#E8DDC8', background: 'rgba(41,37,34,.92)', border: '1px solid rgba(232,221,200,.25)', padding: '8px 12px' }}>
          Não foi possível carregar o álbum salvo ({error}). Exibindo conteúdo de demonstração.
        </div>
      )}
    </>
  )
}

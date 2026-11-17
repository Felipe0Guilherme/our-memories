import type { Album, AlbumPage, Photo } from '../types/album'
import { DEFAULT_SETTINGS } from '../types/album'
import { demoPhoto } from './demoPhotos'

let n = 0
function photo(pageId: string, position: number, caption: string, takenOn: string | null, o: 'landscape' | 'portrait' | 'square' = 'landscape'): Photo {
  const d = demoPhoto(n++, o)
  return {
    id: `demo-photo-${n}`, pageId, position, fileName: `demonstracao-${n}.svg`,
    storagePath: '', url: d.url, caption, takenOn, width: d.width, height: d.height,
  }
}

function page(id: string, position: number, layout: AlbumPage['layout'], title: string, body: string, photos: Photo[] = []): AlbumPage {
  return { id, position, layout, title, body, photos, isDemo: true }
}

/**
 * Álbum de demonstração. Aparece apenas enquanto não há páginas reais salvas
 * e é sempre identificado na tela como conteúdo de demonstração.
 */
export function buildDemoAlbum(): Album {
  n = 0
  return {
    settings: { ...DEFAULT_SETTINGS },
    pages: [
      page('demo-1', 1, 'dedication', 'Dedicatória', 'Este é um texto de demonstração.\nNa administração, você escreve a dedicatória verdadeira deste álbum.'),
      page('demo-2', 2, 'photo', '', '', [photo('demo-2', 0, 'Legenda de demonstração', '2024-03-09')]),
      page('demo-3', 3, 'duo', '', '', [
        photo('demo-3', 0, 'Primeira foto de demonstração', '2024-05-18', 'portrait'),
        photo('demo-3', 1, 'Segunda foto de demonstração', '2024-05-18'),
      ]),
      page('demo-4', 4, 'message', 'Mensagem de demonstração', 'Aqui entra uma carta sua.\n\nEste espaço foi pensado para textos mais longos, com parágrafos, memórias e o que você quiser dizer. Edite esta página na administração para substituí-la por uma mensagem de verdade.'),
      page('demo-5', 5, 'collage', 'anotação de demonstração', '', [
        photo('demo-5', 0, '', null), photo('demo-5', 1, '', null, 'portrait'), photo('demo-5', 2, '', null),
        photo('demo-5', 3, '', null, 'square'), photo('demo-5', 4, '', null),
      ]),
      page('demo-6', 6, 'closing', 'Fim de demonstração', 'Esta é a página de encerramento. Aqui vai a sua mensagem final.', [
        photo('demo-6', 0, 'Última foto de demonstração', '2024-12-31'),
      ]),
    ],
  }
}

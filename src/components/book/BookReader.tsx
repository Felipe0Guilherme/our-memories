import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useReducedMotion } from 'framer-motion'
import type { Album } from '../../types/album'
import { BookPage } from './BookPage'
import { EndpaperContent } from './Endpaper'
import { renderLayout } from './layouts'
import { BookActionsContext } from './BookActions'
import { sleep } from '../../lib/format'

// A tipagem exige todas as props; passamos só as relevantes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Flip = HTMLFlipBook as unknown as React.ComponentType<any>

type Sheet =
  | { kind: 'endpaper' }
  | { kind: 'page'; index: number }
  | { kind: 'blank' }
  | { kind: 'back' }

export interface ReaderHandle {
  atStart: () => boolean
  next: () => void
  prev: () => void
  /** Volta, com animação, até a primeira dupla de páginas. */
  goToStart: () => Promise<void>
}

interface Props {
  album: Album
  w: number
  h: number
  portrait: boolean
  interactive: boolean
  onSpreadChange?: (label: string) => void
}

export const BookReader = forwardRef<ReaderHandle, Props>(function BookReader(
  { album, w, h, portrait, interactive, onSpreadChange }, ref,
) {
  const reduce = useReducedMotion()
  const flipRef = useRef<{ pageFlip: () => any } | null>(null)
  const [current, setCurrent] = useState(0)
  const currentRef = useRef(0)
  const pages = album.pages

  const sheets = useMemo<Sheet[]>(() => {
    const list: Sheet[] = []
    if (!portrait) list.push({ kind: 'endpaper' })
    pages.forEach((_, i) => list.push({ kind: 'page', index: i }))
    if (!portrait && list.length % 2 === 0) list.push({ kind: 'blank' })
    list.push({ kind: 'back' })
    return list
  }, [pages, portrait])

  const firstIndex = portrait ? 0 : 0
  const flippingTime = reduce ? 1 : 900

  const contentNumber = useCallback((sheetIdx: number) => {
    const s = sheets[sheetIdx]
    return s && s.kind === 'page' ? s.index + 1 : null
  }, [sheets])

  const report = useCallback((idx: number) => {
    const total = pages.length
    const a = contentNumber(idx)
    const b = portrait ? null : contentNumber(idx + 1)
    let label = ''
    if (a && b) label = `${a} – ${b} de ${total}`
    else if (a) label = `${a} de ${total}`
    else if (b) label = `${b} de ${total}`
    else label = idx === 0 ? 'abertura' : 'fim'
    onSpreadChange?.(label)
  }, [contentNumber, onSpreadChange, pages.length, portrait])

  useEffect(() => { report(0) }, [report])

  const api = () => flipRef.current?.pageFlip?.()

  useImperativeHandle(ref, () => ({
    atStart: () => currentRef.current === firstIndex,
    next: () => api()?.flipNext(),
    prev: () => api()?.flipPrev(),
    goToStart: async () => {
      const pf = api()
      if (!pf || currentRef.current === firstIndex) return
      if (reduce) pf.turnToPage(firstIndex)
      else pf.flip(firstIndex)
      await sleep(reduce ? 50 : flippingTime + 250)
    },
  }), [firstIndex, flippingTime, reduce])

  // teclado
  useEffect(() => {
    if (!interactive) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') api()?.flipNext()
      if (e.key === 'ArrowLeft') api()?.flipPrev()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [interactive])

  const restart = useCallback(() => {
    const pf = api()
    if (!pf) return
    if (reduce) pf.turnToPage(firstIndex)
    else pf.flip(firstIndex)
  }, [firstIndex, reduce])

  const visible = (idx: number) => Math.abs(idx - current) <= 3

  const items = sheets.map((s, idx) => {
    const side = portrait ? 'single' : idx % 2 === 0 ? 'left' : 'right'
    switch (s.kind) {
      case 'endpaper':
        return <BookPage key="endpaper" side="left"><EndpaperContent settings={album.settings} /></BookPage>
      case 'blank':
        return <BookPage key="blank" side={side} />
      case 'back':
        return <BookPage key="back" side={side} density="hard" hard><div className="om-page__inner" style={{ display: 'grid', placeItems: 'center' }}>
          <div style={{ width: '16cqw', height: 1, background: 'rgba(232,221,200,.4)' }} />
        </div></BookPage>
      case 'page': {
        const page = pages[s.index]
        return (
          <BookPage key={page.id} side={side} number={s.index + 1} outerLeft={side === 'left'}>
            {renderLayout(page, visible(idx))}
          </BookPage>
        )
      }
    }
  })

  return (
    <BookActionsContext.Provider value={{ restart }}>
      <div style={{ width: portrait ? w : w * 2, height: h, pointerEvents: interactive ? 'auto' : 'none' }}>
        <Flip
          key={`${w}x${h}-${portrait}-${pages.length}`}
          ref={flipRef}
          width={w} height={h} size="fixed" minWidth={w} maxWidth={w} minHeight={h} maxHeight={h}
          startPage={Math.min(currentRef.current, sheets.length - 1)}
          showCover={false} usePortrait={portrait} drawShadow maxShadowOpacity={0.45}
          flippingTime={flippingTime} mobileScrollSupport={false} clickEventForward useMouseEvents
          swipeDistance={24} showPageCorners={!portrait} disableFlipByClick={false} autoSize={false} startZIndex={0}
          className="om-flipbook" style={{}}
          onFlip={(e: { data: number }) => { currentRef.current = e.data; setCurrent(e.data); report(e.data) }}
        >
          {items}
        </Flip>
      </div>
    </BookActionsContext.Provider>
  )
})

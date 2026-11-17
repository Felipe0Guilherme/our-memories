import { useEffect, useState } from 'react'

export interface BookSize { w: number; h: number; portrait: boolean; vw: number; vh: number }

const RATIO = 0.72 // largura / altura de uma página

function calc(): BookSize {
  const vw = window.innerWidth
  const vh = window.visualViewport?.height ?? window.innerHeight
  const portrait = vw < 820 || vw / vh < 0.9
  const availH = vh - (portrait ? 150 : 150)
  const availW = portrait ? vw - 28 : (vw * 0.94) / 2
  const h = Math.max(280, Math.min(availH, availW / RATIO, 860))
  return { w: Math.round(h * RATIO), h: Math.round(h), portrait, vw, vh }
}

export function useBookSize(): BookSize {
  const [size, setSize] = useState<BookSize>(calc)
  useEffect(() => {
    let t: number | undefined
    const on = () => { window.clearTimeout(t); t = window.setTimeout(() => setSize(calc()), 140) }
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); window.clearTimeout(t) }
  }, [])
  return size
}

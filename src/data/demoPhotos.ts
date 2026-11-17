/**
 * Fotografias de DEMONSTRAÇÃO geradas localmente (SVG de cores chapadas).
 * Não são fotos reais nem ficam salvas em lugar nenhum.
 */
interface Tone { sky: string; far: string; near: string; sun: string; ink: string }

const TONES: Tone[] = [
  { sky: '#D9C9AA', far: '#A88F73', near: '#6E5846', sun: '#F1E6CF', ink: '#3B2E26' },
  { sky: '#B9B3A0', far: '#8A8472', near: '#4F4B40', sun: '#E8DDC8', ink: '#2C2925' },
  { sky: '#C9A98F', far: '#9B7660', near: '#5A4034', sun: '#EFDDC2', ink: '#33261F' },
  { sky: '#A9B1A4', far: '#7C8776', near: '#445042', sun: '#E9E2CD', ink: '#27302A' },
  { sky: '#CDBFA3', far: '#B09876', near: '#7A6247', sun: '#F5F0E6', ink: '#3A2F25' },
  { sky: '#B7A99B', far: '#8D7A6B', near: '#54453B', sun: '#E6D8C3', ink: '#2E251F' },
]

export function demoPhoto(seed: number, orientation: 'landscape' | 'portrait' | 'square' = 'landscape') {
  const t = TONES[seed % TONES.length]
  const [w, h] = orientation === 'landscape' ? [900, 640] : orientation === 'portrait' ? [640, 880] : [760, 760]
  const sunX = 0.25 + ((seed * 37) % 50) / 100
  const horizon = h * (0.52 + ((seed * 13) % 12) / 100)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect width="${w}" height="${h}" fill="${t.sky}"/>
<circle cx="${w * sunX}" cy="${h * 0.3}" r="${w * 0.07}" fill="${t.sun}"/>
<path d="M0 ${horizon} L${w * 0.22} ${horizon - h * 0.12} L${w * 0.45} ${horizon - h * 0.03} L${w * 0.7} ${horizon - h * 0.15} L${w} ${horizon - h * 0.04} L${w} ${h} L0 ${h} Z" fill="${t.far}"/>
<path d="M0 ${horizon + h * 0.12} L${w * 0.3} ${horizon + h * 0.04} L${w * 0.62} ${horizon + h * 0.13} L${w} ${horizon + h * 0.06} L${w} ${h} L0 ${h} Z" fill="${t.near}"/>
<rect x="${w * 0.58}" y="${horizon + h * 0.02}" width="${w * 0.05}" height="${h * 0.1}" fill="${t.ink}"/>
<text x="${w / 2}" y="${h - 26}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(w * 0.028)}" letter-spacing="4" fill="${t.sun}" fill-opacity="0.85">FOTO DE DEMONSTRAÇÃO</text>
</svg>`
  return { url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width: w, height: h }
}

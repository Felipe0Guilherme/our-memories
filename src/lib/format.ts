const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

/** Converte "2024-03-09" em "9 de março de 2024" sem passar por fuso horário. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  return `${Number(m[3])} de ${MONTHS[Number(m[2]) - 1]} de ${m[1]}`
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

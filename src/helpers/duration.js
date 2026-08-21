export function parseDuration(str) {
  const m = String(str).trim().toLowerCase().match(/^(\d+)\s*(s|m|h|d|detik|menit|jam|hari)?$/)
  if (!m) return null
  const n = parseInt(m[1])
  const unit = m[2] || 'm'
  if (['s', 'detik'].includes(unit)) return n * 1000
  if (['m', 'menit'].includes(unit)) return n * 60 * 1000
  if (['h', 'jam'].includes(unit)) return n * 60 * 60 * 1000
  if (['d', 'hari'].includes(unit)) return n * 24 * 60 * 60 * 1000
  return n * 60 * 1000
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s} detik`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} menit`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam ${m % 60} menit`
  const d = Math.floor(h / 24)
  return `${d} hari ${h % 24} jam`
}

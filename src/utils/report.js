export function toNumber(value, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/,/g, '').trim())
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

export function toSeconds(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const seconds = value > 1_000_000 ? value / 1000 : value
    return Math.max(0, Math.round(seconds))
  }

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return fallback

    const minMatch = raw.match(/(\d+(?:\.\d+)?)\s*分/)
    const secMatch = raw.match(/(\d+(?:\.\d+)?)\s*秒/)

    if (minMatch || secMatch) {
      const minutes = minMatch ? toNumber(minMatch[1], 0) : 0
      const seconds = secMatch ? toNumber(secMatch[1], 0) : 0
      const total = minutes * 60 + seconds
      return Math.max(0, Math.round(total))
    }

    const n = toNumber(raw, fallback)
    if (!Number.isFinite(n)) return fallback
    const seconds = n > 1_000_000 ? n / 1000 : n
    return Math.max(0, Math.round(seconds))
  }

  return fallback
}

export function formatDurationMinSec(value) {
  const seconds = toSeconds(value, 0)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

export function deriveDurationSeconds({ totalInterviewTime, beginTime, endTime } = {}) {
  const direct = toSeconds(totalInterviewTime, 0)
  if (direct > 0) return direct

  const beginMs = beginTime ? Date.parse(beginTime) : NaN
  const endMs = endTime ? Date.parse(endTime) : NaN
  if (Number.isFinite(beginMs) && Number.isFinite(endMs) && endMs > beginMs) {
    return Math.round((endMs - beginMs) / 1000)
  }

  return 0
}

export function getAccuracyEvaluation(round) {
  if (!round || typeof round !== 'object') return null
  return (
    round.accuracy_evaluation ||
    round.accuracyEvaluation ||
    round.accuracy_evaluate ||
    round.accuracy ||
    null
  )
}

export function getAccuracyScore(round) {
  const ae = getAccuracyEvaluation(round)
  if (ae && typeof ae === 'object') {
    return toNumber(ae.score ?? ae.total_score ?? ae.totalScore ?? ae.value, 0)
  }
  return toNumber(round?.accuracy_score ?? round?.accuracyScore ?? round?.score, 0)
}


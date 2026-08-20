const EFFECT_VERDICTS = new Set(['observed', 'not_observed', 'pending'])
const INTERPRETATION_SECTIONS = ['noticedChange', 'timingReason', 'nextStep']

function parseJsonResponse(response, name) {
  if (typeof response === 'string') {
    try {
      return JSON.parse(response)
    } catch {
      throw new Error(`${name} response is not valid JSON`)
    }
  }
  return response
}

export function mapEffectResult(response, indicator, markerId) {
  const result = parseJsonResponse(response, 'effect')
  if (!result || typeof result !== 'object' || Array.isArray(result) || result.indicator !== indicator || result.marker_id !== markerId || !EFFECT_VERDICTS.has(result.verdict) || !Array.isArray(result.reasons) || result.reasons.some((reason) => typeof reason !== 'string')) {
    throw new Error('effect response has an unexpected structure')
  }
  return { verdict: result.verdict, reasons: result.reasons }
}

export function mapInterpretationCard(response) {
  const result = parseJsonResponse(response, 'interpretation')
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('interpretation response must be an object')
  return INTERPRETATION_SECTIONS.map((key) => {
    const section = result[key]
    if (!section || typeof section.title !== 'string' || typeof section.description !== 'string') throw new Error('interpretation response has an unexpected structure')
    return { key, title: section.title, description: section.description }
  })
}

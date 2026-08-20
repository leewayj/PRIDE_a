function parseIndicatorResult(value) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    throw new Error('indicatorResult is not valid JSON')
  }
}

export function validateIndicatorExtraction(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response) || typeof response.photoStoreSummary !== 'string') {
    throw new Error('indicator extraction response has an unexpected structure')
  }
  const result = parseIndicatorResult(response.indicatorResult)
  if (
    !result ||
    typeof result !== 'object' ||
    !Number.isInteger(result.total_count) ||
    !Number.isInteger(result.succeeded_count) ||
    !Number.isInteger(result.skipped_count) ||
    !Number.isInteger(result.failed_count) ||
    !Array.isArray(result.results) ||
    !Array.isArray(result.year_notices)
  ) {
    throw new Error('indicatorResult has an unexpected structure')
  }
  result.results.forEach((item) => {
    if (!item || typeof item.filename !== 'string' || typeof item.status !== 'string') throw new Error('indicator extraction item has an unexpected structure')
  })
  if (result.succeeded_count === 0) throw new Error('no photos were stored')
  return {
    ...result,
    issues: result.results
      .filter(({ reason }) => typeof reason === 'string' && reason.trim())
      .map(({ filename, status, reason }) => ({ filename, status, reason })),
  }
}

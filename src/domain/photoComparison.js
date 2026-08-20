export function validatePhotoComparison(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response) || !response.indicatorDiffs || typeof response.indicatorDiffs !== 'object' || Array.isArray(response.indicatorDiffs) || !Object.hasOwn(response, 'date1Photo') || !Object.hasOwn(response, 'date2Photo')) {
    throw new Error('photo comparison response has an unexpected structure')
  }
  const differences = Object.entries(response.indicatorDiffs).map(([indicator, value]) => {
    if (typeof value !== 'number') throw new Error('indicator difference must be a number')
    return { indicator, value }
  })
  return {
    date1Photo: response.date1Photo,
    date2Photo: response.date2Photo,
    differences,
    isEmpty: response.date1Photo == null && response.date2Photo == null && differences.length === 0,
  }
}

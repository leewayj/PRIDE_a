export function mapYearCounts(yearCounts) {
  if (!yearCounts || typeof yearCounts !== 'object' || Array.isArray(yearCounts)) {
    throw new Error('yearCounts must be an object')
  }

  return Object.entries(yearCounts)
    .map(([year, count]) => ({ year, count }))
    .sort((left, right) => Number(left.year) - Number(right.year))
}

const REJECTION_REASON_LABELS = Object.freeze({
  'angle-out-of-range': '얼굴 각도 문제',
  'low-similarity': '본인 사진 유사도 부족',
  'low-sharpness': '선명도 부족',
})

export function summarizeExcludedPhotos(photos) {
  const counts = new Map()

  photos.forEach(({ grade, rejectionReasonCode }) => {
    if (grade !== 'exclude' || !rejectionReasonCode) return
    counts.set(rejectionReasonCode, (counts.get(rejectionReasonCode) ?? 0) + 1)
  })

  return [...counts.entries()].map(([reasonCode, count]) => ({
    reasonCode,
    label: REJECTION_REASON_LABELS[reasonCode] ?? reasonCode,
    count,
  }))
}

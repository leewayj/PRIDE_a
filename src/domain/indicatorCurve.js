export const INDICATOR_OPTIONS = [
  { metricType: 'face-width', indicator: 'face_width_ratio', label: '얼굴폭' },
  { metricType: 'jaw-angle', indicator: 'jaw_angle_deg', label: '턱선 각도' },
  { metricType: 'eyelid-height', indicator: 'eyelid_height_ratio', label: '눈꺼풀 높이' },
  { metricType: 'mouth-corner-angle', indicator: 'mouth_corner_angle_deg', label: '입가 각도' },
]

function parseCurveResponse(response) {
  if (typeof response === 'string') {
    try {
      return JSON.parse(response)
    } catch {
      throw new Error('indicator curve response is not valid JSON')
    }
  }

  return response
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

export function mapIndicatorCurveToChartData(response, option) {
  const result = parseCurveResponse(response)

  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('indicator curve response must be an object')
  }
  if (result.indicator !== option.indicator || !Array.isArray(result.points) || !Array.isArray(result.change_points)) {
    throw new Error('indicator curve response has an unexpected structure')
  }

  const metricPoints = result.points.map((point, index) => {
    if (!point || typeof point !== 'object' || !isValidDate(point.date) || typeof point.value !== 'number') {
      throw new Error('indicator curve point has an unexpected structure')
    }

    return {
      photoId: `${option.indicator}-${point.date}-${index}`,
      metricType: option.metricType,
      capturedAt: point.date,
      value: point.value,
    }
  })

  const changePoints = result.change_points.map((point) => {
    if (!point || typeof point !== 'object' || !isValidDate(point.date)) {
      throw new Error('indicator curve change point has an unexpected structure')
    }

    return { ...point, metricType: option.metricType }
  })

  return {
    metricPoints,
    changePoints,
    totalCount: typeof result.total_count === 'number' ? result.total_count : metricPoints.length,
  }
}

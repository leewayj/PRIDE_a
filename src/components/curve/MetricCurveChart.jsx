const VIEW_WIDTH = 320
const VIEW_HEIGHT = 190
const PADDING = { top: 18, right: 12, bottom: 34, left: 12 }

function yearOf(capturedAt) {
  return new Date(capturedAt).getUTCFullYear()
}

function MetricCurveChart({ points }) {
  if (points.length === 0) {
    return (
      <div className="metric-curve-chart__empty">
        <strong>아직 변화를 표시할 데이터가 부족해요.</strong>
        <p>사진을 더 추가하면 시간에 따른 변화가 여기에 표시됩니다.</p>
      </div>
    )
  }

  const timestamps = points.map(({ capturedAt }) => new Date(capturedAt).getTime())
  const values = points.map(({ value }) => value)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right
  const plotHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom
  const timeRange = maxTime - minTime
  const valueRange = maxValue - minValue

  const plottedPoints = points.map((point, index) => ({
    ...point,
    x: timeRange === 0
      ? PADDING.left + plotWidth / 2
      : PADDING.left + ((timestamps[index] - minTime) / timeRange) * plotWidth,
    y: valueRange === 0
      ? PADDING.top + plotHeight / 2
      : PADDING.top + (1 - ((point.value - minValue) / valueRange)) * plotHeight,
  }))

  const path = plottedPoints
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')
  const years = [...new Set(points.map(({ capturedAt }) => yearOf(capturedAt)))]

  return (
    <div className="metric-curve-chart">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label={`${years[0]}년부터 ${years[years.length - 1]}년까지의 턱선 각도 변화곡선`}
      >
        {[0, 0.5, 1].map((position) => (
          <line
            className="metric-curve-chart__grid-line"
            x1={PADDING.left}
            x2={VIEW_WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight * position}
            y2={PADDING.top + plotHeight * position}
            key={position}
          />
        ))}

        {points.length > 1 && <path className="metric-curve-chart__line" d={path} />}

        {plottedPoints.map(({ photoId, x, y }) => (
          <circle className="metric-curve-chart__point" cx={x} cy={y} r="3" key={photoId} />
        ))}

        {years.map((year, index) => {
          const x = years.length === 1
            ? VIEW_WIDTH / 2
            : PADDING.left + (index / (years.length - 1)) * plotWidth

          return (
            <text className="metric-curve-chart__year" x={x} y={VIEW_HEIGHT - 8} textAnchor="middle" key={year}>
              {year}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export default MetricCurveChart

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 190
const PADDING = { top: 18, right: 12, bottom: 34, left: 12 }

function yearOf(capturedAt) {
  return new Date(capturedAt).getUTCFullYear()
}

function MetricCurveChart({
  points,
  changePoints = [],
  careMarkers = [],
  selectedMarker,
  onSelectMarker,
  metricLabel = '턱선 각도',
}) {
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
  const xForDate = (date) => {
    const timestamp = new Date(date).getTime()
    if (timeRange === 0 || Number.isNaN(timestamp)) return PADDING.left + plotWidth / 2
    const position = PADDING.left + ((timestamp - minTime) / timeRange) * plotWidth
    return Math.min(VIEW_WIDTH - PADDING.right, Math.max(PADDING.left, position))
  }
  const nearestPointForDate = (date) => {
    const timestamp = new Date(date).getTime()
    return plottedPoints.reduce((nearest, point) => (
      Math.abs(new Date(point.capturedAt).getTime() - timestamp)
        < Math.abs(new Date(nearest.capturedAt).getTime() - timestamp)
        ? point
        : nearest
    ), plottedPoints[0])
  }
  const selectOnKeyboard = (event, marker) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelectMarker(marker)
  }
  const changeMarkerXs = changePoints.map(({ date }) => xForDate(date))

  return (
    <div className="metric-curve-chart">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label={`${years[0]}년부터 ${years[years.length - 1]}년까지의 ${metricLabel} 변화곡선`}
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

        {changePoints.map((changePoint) => {
          const key = `change-${changePoint.metricType}-${changePoint.date}`
          const x = xForDate(changePoint.date)
          const y = Math.max(PADDING.top + 12, nearestPointForDate(changePoint.date).y - 14)
          const marker = { type: 'changePoint', key, item: changePoint }
          const isSelected = selectedMarker?.key === key

          return (
            <g
              className={`metric-curve-chart__marker metric-curve-chart__marker--change${isSelected ? ' is-selected' : ''}`}
              role="button"
              tabIndex="0"
              aria-label={`${yearOf(changePoint.date)}년 변화 시점`}
              onClick={() => onSelectMarker(marker)}
              onKeyDown={(event) => selectOnKeyboard(event, marker)}
              key={key}
            >
              <circle className="metric-curve-chart__marker-hit" cx={x} cy={y} r="11" />
              <path d={`M ${x} ${y + 6} L ${x - 6} ${y - 5} L ${x + 6} ${y - 5} Z`} />
            </g>
          )
        })}

        {careMarkers.map((careMarker, index) => {
          const key = `care-${careMarker.id}`
          const originalX = xForDate(careMarker.date)
          const overlapsChangePoint = changeMarkerXs.some((x) => Math.abs(x - originalX) < 12)
          const offset = originalX > VIEW_WIDTH / 2 ? -16 : 16
          const x = overlapsChangePoint
            ? Math.min(VIEW_WIDTH - PADDING.right, Math.max(PADDING.left, originalX + offset))
            : originalX
          const y = PADDING.top + 9 + (index % 2) * 18
          const marker = { type: 'careMarker', key, item: careMarker }
          const isSelected = selectedMarker?.key === key

          return (
            <g
              className={`metric-curve-chart__marker metric-curve-chart__marker--care${isSelected ? ' is-selected' : ''}`}
              role="button"
              tabIndex="0"
              aria-label={`${careMarker.kind}, ${yearOf(careMarker.date)}년 관리 기록`}
              onClick={() => onSelectMarker(marker)}
              onKeyDown={(event) => selectOnKeyboard(event, marker)}
              key={key}
            >
              <circle className="metric-curve-chart__marker-hit" cx={x} cy={y} r="11" />
              <path d={`M ${x} ${y - 6} L ${x + 6} ${y} L ${x} ${y + 6} L ${x - 6} ${y} Z`} />
            </g>
          )
        })}

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

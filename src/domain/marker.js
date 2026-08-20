function parseMarkerResponse(response) {
  if (typeof response === 'string') {
    try {
      return JSON.parse(response)
    } catch {
      throw new Error('marker response is not valid JSON')
    }
  }

  return response
}

export function mapMarkerListToCareMarkers(response) {
  const result = parseMarkerResponse(response)
  if (!result || typeof result !== 'object' || Array.isArray(result) || !Array.isArray(result.markers)) {
    throw new Error('marker list response has an unexpected structure')
  }

  return result.markers.map((marker) => {
    if (
      !marker ||
      typeof marker !== 'object' ||
      typeof marker.marker_id !== 'string' ||
      typeof marker.marker_date !== 'string' ||
      typeof marker.note !== 'string'
    ) {
      throw new Error('marker has an unexpected structure')
    }

    return {
      id: marker.marker_id,
      date: marker.marker_date,
      kind: marker.note,
      rawText: marker.note,
    }
  })
}

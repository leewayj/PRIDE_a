// GET /photos 응답 검증. 각 사진은 { capturedAt, id, imageBase64 } 형태로 온다.
export function validateStoredPhotos(response) {
  if (!Array.isArray(response)) {
    throw new Error('photos response must be an array')
  }

  response.forEach((photo) => {
    if (
      !photo ||
      typeof photo !== 'object' ||
      typeof photo.id !== 'string' ||
      typeof photo.capturedAt !== 'string' ||
      typeof photo.imageBase64 !== 'string'
    ) {
      throw new Error('photo item has an unexpected structure')
    }
  })

  return response
}

function parseJsonResponse(response, label) {
  if (typeof response !== 'string') return response

  try {
    return JSON.parse(response)
  } catch {
    throw new Error(`${label} 응답이 JSON 형식이 아닙니다.`)
  }
}

export function parseOnboardingStatus(response) {
  const status = parseJsonResponse(response, '온보딩 상태')
  if (!status || typeof status !== 'object' || Array.isArray(status) || typeof status.acknowledged !== 'boolean') {
    throw new Error('온보딩 상태 응답 형식이 올바르지 않습니다.')
  }

  return status.acknowledged
}

export function parseFaceRegistrationStatus(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response) || typeof response.faceRegistered !== 'boolean') {
    throw new Error('얼굴 등록 상태 응답 형식이 올바르지 않습니다.')
  }

  return response.faceRegistered
}

import { apiRequest } from './client.js'

export function registerFace(userId, files) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('얼굴 등록 API 요청에 유효한 userId가 필요합니다.')
  }

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('얼굴 등록 API 요청에 사진 파일이 필요합니다.')
  }

  if (files.some((file) => !(file instanceof File))) {
    throw new Error('얼굴 등록 API에는 유효한 사진 파일만 전달할 수 있습니다.')
  }

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/face/register?${query}`, {
    method: 'POST',
    body: formData,
  })
}

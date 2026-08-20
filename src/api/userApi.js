import { apiRequest } from './client.js'

export async function createGuestUser() {
  const user = await apiRequest('/users', {
    method: 'POST',
  })

  if (!user || typeof user !== 'object' || typeof user.id !== 'string' || !user.id.trim()) {
    throw new Error('게스트 사용자 생성 응답에 유효한 id가 없습니다.')
  }

  return user
}

import { createGuestUser } from '../api/userApi.js'

const USER_ID_STORAGE_KEY = 'retrace_user_id'

let pendingUserPromise = null

export function getStoredUserId() {
  return localStorage.getItem(USER_ID_STORAGE_KEY) || null
}

export function setStoredUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new TypeError('userId는 비어 있지 않은 문자열이어야 합니다.')
  }

  localStorage.setItem(USER_ID_STORAGE_KEY, userId)
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_ID_STORAGE_KEY)
}

export async function getOrCreateUserId() {
  const storedUserId = getStoredUserId()
  if (storedUserId) {
    return storedUserId
  }

  if (!pendingUserPromise) {
    pendingUserPromise = createGuestUser().then((user) => {
      setStoredUserId(user.id)
      return user.id
    })
  }

  try {
    return await pendingUserPromise
  } finally {
    pendingUserPromise = null
  }
}

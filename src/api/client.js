const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  const normalizedPath = String(path).replace(/^\/+/, '')
  return `${API_BASE_URL}/${normalizedPath}`
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

export async function apiRequest(path, options = {}) {
  const { headers: providedHeaders, body, ...requestOptions } = options
  const headers = new Headers(providedHeaders)
  let requestBody = body
  const isJsonBody =
    Array.isArray(body) ||
    (body != null && typeof body === 'object' && Object.getPrototypeOf(body) === Object.prototype)

  if (isJsonBody) {
    requestBody = JSON.stringify(body)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...requestOptions,
    headers,
    body: requestBody,
  })
  const responseBody = await parseResponse(response)

  if (!response.ok) {
    const error = new Error(`API 요청에 실패했습니다. (${response.status} ${response.statusText})`)
    error.status = response.status
    error.body = responseBody
    throw error
  }

  return responseBody
}

import { apiRequest } from './client.js'

function assertOptionalPrompt(prompt) {
  if (prompt == null) return

  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('prompt must be a non-empty string')
  }
}

export function testLlm(prompt) {
  assertOptionalPrompt(prompt)

  if (prompt == null) {
    return apiRequest('/llm/test')
  }

  const query = new URLSearchParams({ prompt })
  return apiRequest(`/llm/test?${query}`)
}

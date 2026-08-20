import { apiRequest } from './client.js'

export function checkAiServerHealth() {
  return apiRequest('/ai-server/health-check')
}

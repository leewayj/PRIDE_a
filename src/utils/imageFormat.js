// base64로 인코딩된 이미지의 시작 바이트로 실제 포맷(JPEG/PNG 등)을 판별해
// <img> 태그에 바로 쓸 수 있는 data URL을 만든다.
// 서버가 사진마다 다른 원본 포맷(JPEG, PNG 등)을 섞어서 내려주기 때문에 필요하다.
const BASE64_SIGNATURES = [
  { prefix: '/9j/', mimeType: 'image/jpeg' },
  { prefix: 'iVBORw0KGgo', mimeType: 'image/png' },
  { prefix: 'R0lGODlh', mimeType: 'image/gif' },
  { prefix: 'R0lGODdh', mimeType: 'image/gif' },
  { prefix: 'UklGR', mimeType: 'image/webp' },
]

export function buildImageDataUrl(imageBase64) {
  if (typeof imageBase64 !== 'string' || !imageBase64.trim()) return ''

  const signature = BASE64_SIGNATURES.find(({ prefix }) => imageBase64.startsWith(prefix))
  const mimeType = signature?.mimeType ?? 'image/jpeg'

  return `data:${mimeType};base64,${imageBase64}`
}

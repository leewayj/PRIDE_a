export function getPhotoStatus(count) {
  if (count === 0) return { label: '아직 없음', modifier: 'empty' }
  if (count < 5) return { label: '사진 적음', modifier: 'low' }
  return { label: '사진 충분', modifier: 'enough' }
}

export function formatPhotoDate(value) {
  if (!value) return '촬영 날짜 확인 불가'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '촬영 날짜 확인 불가'

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}. ${month}. ${day}.`
}

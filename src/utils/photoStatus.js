import { YEAR_PHOTO_STATUS } from '../constants/photo.js'

export function getYearPhotoStatus(count) {
  if (count === 0) return YEAR_PHOTO_STATUS.EMPTY
  if (count < 5) return YEAR_PHOTO_STATUS.LOW
  return YEAR_PHOTO_STATUS.SUFFICIENT
}

export function getYearPhotoStatusLabel(status) {
  const labels = {
    [YEAR_PHOTO_STATUS.EMPTY]: '아직 없음',
    [YEAR_PHOTO_STATUS.LOW]: '사진 적음',
    [YEAR_PHOTO_STATUS.SUFFICIENT]: '사진 충분',
  }
  return labels[status] ?? labels[YEAR_PHOTO_STATUS.EMPTY]
}

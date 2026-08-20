import { PHOTO_ANALYSIS_STATUS } from '../constants/photo.js'

export function groupPhotosByYear(photos) {
  const groupedPhotos = new Map()

  photos.forEach((photo) => {
    if (photo.analysisStatus !== PHOTO_ANALYSIS_STATUS.SUCCESS || !Number.isInteger(photo.year)) return
    const yearPhotos = groupedPhotos.get(photo.year) ?? []
    yearPhotos.push(photo)
    groupedPhotos.set(photo.year, yearPhotos)
  })

  return [...groupedPhotos.entries()]
    .sort(([firstYear], [secondYear]) => secondYear - firstYear)
    .map(([year, yearPhotos]) => ({
      year,
      photos: yearPhotos.sort((first, second) => (
        (new Date(second.capturedAt).getTime() || 0) - (new Date(first.capturedAt).getTime() || 0)
      )),
    }))
}

// 서버(GET /photos)에 실제 저장된 사진을 연도별로 묶는다.
// 로컬 업로드 대기열용 groupPhotosByYear와 달리 analysisStatus/year 필드가 없고
// { id, capturedAt, imageBase64 } 형태이므로, capturedAt에서 연도를 직접 추출한다.
export function groupStoredPhotosByYear(photos) {
  const groupedPhotos = new Map()

  photos.forEach((photo) => {
    const capturedDate = new Date(photo.capturedAt)
    if (Number.isNaN(capturedDate.getTime())) return
    const year = capturedDate.getFullYear()
    const yearPhotos = groupedPhotos.get(year) ?? []
    yearPhotos.push(photo)
    groupedPhotos.set(year, yearPhotos)
  })

  return [...groupedPhotos.entries()]
    .sort(([firstYear], [secondYear]) => secondYear - firstYear)
    .map(([year, yearPhotos]) => ({
      year,
      photos: yearPhotos.sort((first, second) => (
        new Date(second.capturedAt).getTime() - new Date(first.capturedAt).getTime()
      )),
    }))
}

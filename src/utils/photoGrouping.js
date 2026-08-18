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

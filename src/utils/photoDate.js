import * as exifr from 'exifr'

function validDate(value) {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function getPhotoTakenAt(file) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) return null

  try {
    const metadata = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate'])
    const exifDate = validDate(metadata?.DateTimeOriginal) ?? validDate(metadata?.CreateDate)

    if (exifDate) return exifDate
  } catch {
    // Unsupported or malformed EXIF data falls back to the file timestamp.
  }

  return validDate(file.lastModified)
}

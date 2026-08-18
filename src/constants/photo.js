export const PHOTO_ANALYSIS_STATUS = Object.freeze({
  SUCCESS: 'success',
  FAILED: 'failed',
})

export const PHOTO_DATE_SOURCE = Object.freeze({
  EXIF_ORIGINAL: 'exif-original',
  EXIF_CREATE: 'exif-create',
  FILE_MODIFIED: 'file-modified',
})

export const PHOTO_FAILURE_CODE = Object.freeze({
  UNSUPPORTED_FORMAT: 'unsupported-format',
  DATE_NOT_FOUND: 'date-not-found',
  READ_FAILED: 'read-failed',
  ANALYSIS_FAILED: 'analysis-failed',
})

export const YEAR_PHOTO_STATUS = Object.freeze({
  EMPTY: 'empty',
  LOW: 'low',
  SUFFICIENT: 'sufficient',
})

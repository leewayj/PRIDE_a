import { useEffect, useRef } from 'react'
import { formatPhotoDate } from '../../utils/dateFormat.js'

function PhotoPlaceholderIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="7" y="9" width="34" height="30" rx="4" />
      <circle cx="18" cy="19" r="4" />
      <path d="m10 35 9-9 7 7 5-5 7 7" />
    </svg>
  )
}

function PhotoPreview({ file, fileName }) {
  const imageRef = useRef(null)

  useEffect(() => {
    if (!file || !imageRef.current) return undefined

    const previewUrl = URL.createObjectURL(file)
    imageRef.current.src = previewUrl
    return () => URL.revokeObjectURL(previewUrl)
  }, [file])

  if (file) return <img ref={imageRef} alt={fileName || '등록한 사진'} />

  return (
    <div className="photo-card__placeholder">
      <PhotoPlaceholderIcon />
      <span>원본 사진은<br />보관되지 않습니다.</span>
    </div>
  )
}

function PhotoCard({ photo, file, deleting = false, onDelete }) {
  return (
    <article className="photo-card">
      <div className="photo-card__thumbnail">
        <PhotoPreview file={file} fileName={photo.fileName} />
        <button
          className="photo-card__delete"
          type="button"
          aria-label="사진 삭제"
          disabled={deleting}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(photo)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 8 8 8M16 8l-8 8" />
          </svg>
        </button>
      </div>
      <time dateTime={photo.capturedAt ?? undefined}>
        {photo.failureReason ?? formatPhotoDate(photo.capturedAt)}
      </time>
    </article>
  )
}

export { PhotoPlaceholderIcon }
export default PhotoCard

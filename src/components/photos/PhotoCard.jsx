import { useEffect, useRef } from 'react'

function PhotoPlaceholderIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="7" y="9" width="34" height="30" rx="4" />
      <circle cx="18" cy="19" r="4" />
      <path d="m10 35 9-9 7 7 5-5 7 7" />
    </svg>
  )
}

function formatPhotoDate(value) {
  if (!value) return '촬영 날짜 확인 불가'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '촬영 날짜 확인 불가'

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}. ${month}. ${day}.`
}

function PhotoPreview({ file, name }) {
  const imageRef = useRef(null)

  useEffect(() => {
    if (!file || !imageRef.current) return undefined

    const previewUrl = URL.createObjectURL(file)
    imageRef.current.src = previewUrl
    return () => URL.revokeObjectURL(previewUrl)
  }, [file])

  if (file) return <img ref={imageRef} alt={name || '등록한 사진'} />

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
        <PhotoPreview file={file} name={photo.name} />
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
      <time dateTime={photo.takenAt ?? undefined}>{formatPhotoDate(photo.takenAt)}</time>
    </article>
  )
}

export { PhotoPlaceholderIcon }
export default PhotoCard

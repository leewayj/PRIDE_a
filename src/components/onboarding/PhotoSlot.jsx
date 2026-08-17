function PhotoPlaceholderIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4.5" y="5.5" width="23" height="21" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="13" r="2.5" fill="currentColor" />
      <path d="m7.5 23 6.2-6.2 4.3 4.1 2.8-2.6 3.7 4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

function PhotoSlot({ number, previewUrl, fileName, onSelect, onRemove }) {
  if (previewUrl) {
    return (
      <div className="photo-slot photo-slot--selected">
        <img src={previewUrl} alt={`${number}번째 선택 사진 미리보기`} />
        <span className="photo-slot__number">{number}</span>
        <button
          className="photo-slot__remove"
          type="button"
          onClick={onRemove}
          aria-label={`${fileName} 제거`}
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <button className="photo-slot" type="button" onClick={onSelect} aria-label={`${number}번째 사진 선택`}>
      <div className="photo-slot__icon">
        <PhotoPlaceholderIcon />
        <span aria-hidden="true">+</span>
      </div>
      <strong>사진 {number}</strong>
      <span className="photo-slot__hint">선택하기</span>
    </button>
  )
}

export default PhotoSlot

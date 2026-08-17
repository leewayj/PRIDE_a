function PhotoPlaceholderIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4.5" y="5.5" width="23" height="21" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="13" r="2.5" fill="currentColor" />
      <path d="m7.5 23 6.2-6.2 4.3 4.1 2.8-2.6 3.7 4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

function PhotoSlot({ number }) {
  return (
    <div className="photo-slot" aria-label={`${number}번째 사진 선택 영역`}>
      <div className="photo-slot__icon">
        <PhotoPlaceholderIcon />
        <span aria-hidden="true">+</span>
      </div>
      <strong>사진 {number}</strong>
      <span className="photo-slot__hint">선택하기</span>
    </div>
  )
}

export default PhotoSlot

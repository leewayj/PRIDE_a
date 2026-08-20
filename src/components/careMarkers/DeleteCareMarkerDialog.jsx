import { useEffect, useRef } from 'react'
import ActionButton from '../ui/ActionButton.jsx'
import { formatPhotoDate } from '../../utils/dateFormat.js'

function DeleteCareMarkerDialog({ careMarker, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div className="delete-care-marker-dialog__backdrop" role="presentation">
      <div
        className="delete-care-marker-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-care-marker-title"
        aria-describedby="delete-care-marker-description"
      >
        <h2 id="delete-care-marker-title">이 관리 기록을 삭제할까요?</h2>
        <div className="delete-care-marker-dialog__target">
          <strong>{careMarker.kind}</strong>
          <time dateTime={careMarker.date}>{formatPhotoDate(careMarker.date)}</time>
        </div>
        <p id="delete-care-marker-description">현재 RETRACE 화면에서 이 기록이 제거됩니다.</p>
        <div className="delete-care-marker-dialog__actions">
          <ActionButton ref={cancelButtonRef} variant="outline" onClick={onCancel}>취소</ActionButton>
          <ActionButton onClick={onConfirm}>삭제</ActionButton>
        </div>
      </div>
    </div>
  )
}

export default DeleteCareMarkerDialog

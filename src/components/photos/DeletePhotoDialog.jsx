import { useEffect, useRef } from 'react'
import ActionButton from '../ui/ActionButton.jsx'

function DeletePhotoDialog({ deleting, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting) onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleting, onCancel])

  return (
    <div className="delete-photo-dialog__backdrop" role="presentation">
      <div
        className="delete-photo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-photo-title"
        aria-describedby="delete-photo-description"
      >
        <h2 id="delete-photo-title">사진을 삭제할까요?</h2>
        <p id="delete-photo-description">
          기기의 원본 사진은 삭제되지 않고 RETRACE 목록에서만 제거됩니다.
        </p>
        <div className="delete-photo-dialog__actions">
          <ActionButton
            ref={cancelButtonRef}
            variant="outline"
            disabled={deleting}
            onClick={onCancel}
          >
            취소
          </ActionButton>
          <ActionButton disabled={deleting} onClick={onConfirm}>
            삭제
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

export default DeletePhotoDialog

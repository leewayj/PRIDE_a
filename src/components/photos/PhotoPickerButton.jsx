import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import usePhotoSelection from '../../hooks/usePhotoSelection.js'
import { validatePhotoFile } from '../../services/photoAnalysis.js'
import ActionButton from '../ui/ActionButton.jsx'

function PhotoPickerButton({ children = '사진 선택하기', className = '' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const isProcessingRef = useRef(false)
  const [selectionMessage, setSelectionMessage] = useState('')
  const { queueSelectedPhotos } = usePhotoSelection()

  const handlePhotoSelection = (event) => {
    const input = event.currentTarget

    if (isProcessingRef.current || !input.files?.length) return

    try {
      const imageFiles = Array.from(input.files).filter((file) =>
        validatePhotoFile(file).valid,
      )

      if (imageFiles.length === 0) {
        setSelectionMessage('선택할 수 있는 사진이 없어요.')
        return
      }

      isProcessingRef.current = true
      const queuedCount = queueSelectedPhotos(imageFiles)

      if (queuedCount > 0) {
        setSelectionMessage('')
        navigate('/photos/analyzing', { state: location.state })
      } else {
        setSelectionMessage('이미 추가했거나 선택할 수 없는 사진이에요.')
      }
    } finally {
      input.value = ''
      isProcessingRef.current = false
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        className="photo-file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoSelection}
      />
      <ActionButton fullWidth onClick={() => fileInputRef.current?.click()}>
        {children}
      </ActionButton>
      {selectionMessage && (
        <p className="photo-picker-button__message" role="status">{selectionMessage}</p>
      )}
    </div>
  )
}

export default PhotoPickerButton

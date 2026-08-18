import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import usePhotoSelection from '../../hooks/usePhotoSelection.js'
import { validatePhotoFile } from '../../services/photoAnalysis.js'
import ActionButton from '../ui/ActionButton.jsx'

function PhotoPickerButton({ children = '사진 선택하기', className = '' }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const isProcessingRef = useRef(false)
  const { queueSelectedPhotos } = usePhotoSelection()

  const handlePhotoSelection = (event) => {
    const input = event.currentTarget

    if (isProcessingRef.current || !input.files?.length) return

    try {
      const imageFiles = Array.from(input.files).filter((file) =>
        validatePhotoFile(file).valid,
      )

      isProcessingRef.current = true
      const queuedCount = queueSelectedPhotos(imageFiles)

      if (queuedCount > 0) navigate('/photos/analyzing')
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
    </div>
  )
}

export default PhotoPickerButton

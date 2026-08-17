import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoRequirements from '../../components/onboarding/PhotoRequirements.jsx'
import PhotoSlot from '../../components/onboarding/PhotoSlot.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import '../../styles/onboarding.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function OnboardingPhotoSelectPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const selectedPhotosRef = useRef([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [fileError, setFileError] = useState('')

  selectedPhotosRef.current = selectedPhotos

  useEffect(() => () => {
    selectedPhotosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
  }, [])

  const openPhotoPicker = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (event) => {
    const pickedFiles = Array.from(event.target.files ?? [])
    const imageFiles = pickedFiles.filter((file) => file.type.startsWith('image/'))
    const availableSlots = 3 - selectedPhotos.length

    if (imageFiles.length !== pickedFiles.length) {
      setFileError('이미지 파일만 선택할 수 있어요.')
    } else if (imageFiles.length > availableSlots) {
      setFileError('사진은 최대 3장까지 선택할 수 있어요.')
    } else {
      setFileError('')
    }

    const newPhotos = imageFiles.slice(0, availableSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    }))

    if (newPhotos.length > 0) {
      setSelectedPhotos((currentPhotos) => [...currentPhotos, ...newPhotos])
    }

    event.target.value = ''
  }

  const removePhoto = (id) => {
    setSelectedPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find((photo) => photo.id === id)
      if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl)
      return currentPhotos.filter((photo) => photo.id !== id)
    })
    setFileError('')
  }

  return (
    <section className="photo-select-page">
      <header className="photo-select-page__header">
        <button
          className="photo-select-page__back"
          type="button"
          onClick={() => navigate('/onboarding/photos')}
          aria-label="이전 화면으로 돌아가기"
        >
          <BackIcon />
        </button>
      </header>

      <div className="photo-select-page__intro">
        <h1>과거 사진 3장을<br />골라주세요.</h1>
        <p>서로 다른 시기의 정면 사진을 선택해 주세요. <strong>{selectedPhotos.length}/3</strong></p>
      </div>

      <div className="photo-slot-grid">
        {[0, 1, 2].map((index) => {
          const photo = selectedPhotos[index]
          return (
            <PhotoSlot
              number={index + 1}
              previewUrl={photo?.previewUrl}
              fileName={photo?.file.name}
              onSelect={openPhotoPicker}
              onRemove={() => removePhoto(photo.id)}
              key={photo?.id ?? index}
            />
          )
        })}
      </div>

      <input
        ref={fileInputRef}
        className="photo-select-page__file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoChange}
      />

      <button className="photo-select-page__picker" type="button" onClick={openPhotoPicker}>
        {selectedPhotos.length === 0 ? '사진 선택' : '사진 추가 선택'}
      </button>
      {fileError ? <p className="photo-select-page__error" role="alert">{fileError}</p> : null}

      <PhotoRequirements />

      <aside className="photo-select-page__notice">
        <span aria-hidden="true">!</span>
        <p><strong>사진은 기기 안에서만 사용돼요.</strong><br />선택한 사진은 지금 단계에서 업로드되지 않습니다.</p>
      </aside>

      <div className="photo-select-page__cta">
        <ActionButton
          fullWidth
          className="photo-select-page__button"
          disabled={selectedPhotos.length !== 3}
          onClick={() => navigate('/onboarding/complete', {
            state: { photos: selectedPhotos.map(({ file }) => file) },
          })}
        >
          다음
        </ActionButton>
      </div>
    </section>
  )
}

export default OnboardingPhotoSelectPage

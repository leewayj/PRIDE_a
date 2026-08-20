import { useEffect, useRef, useState } from 'react'
import ActionButton from '../ui/ActionButton.jsx'

function todayForInput() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

function CareMarkerBottomSheet({ onClose, onSave }) {
  const [date, setDate] = useState(todayForInput)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const kindInputRef = useRef(null)
  const isSubmittingRef = useRef(false)
  const canSave = date !== '' && note.trim() !== '' && !isSubmitting

  useEffect(() => {
    kindInputRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedNote = note.trim()
    if (!date || !trimmedNote || isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(false)

    try {
      await onSave({ date, note: trimmedNote })
    } catch {
      setSubmitError(true)
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="care-marker-sheet__backdrop" role="presentation">
      <section
        className="care-marker-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-marker-sheet-title"
      >
        <div className="care-marker-sheet__handle" aria-hidden="true" />
        <header className="care-marker-sheet__header">
          <h2 id="care-marker-sheet-title">기록 추가</h2>
          <button type="button" aria-label="기록 추가 닫기" onClick={onClose} disabled={isSubmitting}>×</button>
        </header>

        <form onSubmit={handleSubmit}>
          <label className="care-marker-sheet__field">
            <span>날짜</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>

          <label className="care-marker-sheet__field">
            <span>관리 내용</span>
            <input
              ref={kindInputRef}
              type="text"
              value={note}
              placeholder="어떤 관리를 했나요?"
              maxLength="80"
              onChange={(event) => setNote(event.target.value)}
              required
            />
          </label>
          {submitError && <p className="care-marker-sheet__error" role="alert">관리를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
          <ActionButton fullWidth type="submit" disabled={!canSave}>{isSubmitting ? '저장 중...' : '저장'}</ActionButton>
        </form>
      </section>
    </div>
  )
}

export default CareMarkerBottomSheet

import { useEffect, useRef, useState } from 'react'
import ActionButton from '../ui/ActionButton.jsx'

function todayForInput() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

function CareMarkerBottomSheet({ onClose, onSave }) {
  const [date, setDate] = useState(todayForInput)
  const [kind, setKind] = useState('')
  const [rawText, setRawText] = useState('')
  const kindInputRef = useRef(null)
  const canSave = date !== '' && kind.trim() !== ''

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

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedKind = kind.trim()
    if (!date || !trimmedKind) return

    onSave({
      id: `marker-${crypto.randomUUID()}`,
      kind: trimmedKind,
      date: new Date(`${date}T00:00:00.000Z`).toISOString(),
      rawText: rawText.trim() || trimmedKind,
      registrationPath: 'manual',
    })
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
          <button type="button" aria-label="기록 추가 닫기" onClick={onClose}>×</button>
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
              value={kind}
              placeholder="어떤 관리를 했나요?"
              maxLength="80"
              onChange={(event) => setKind(event.target.value)}
              required
            />
          </label>

          <label className="care-marker-sheet__field">
            <span>메모 <small>선택</small></span>
            <textarea
              value={rawText}
              placeholder="관리에 대해 기억할 내용을 남겨보세요."
              maxLength="500"
              onChange={(event) => setRawText(event.target.value)}
            />
          </label>

          <ActionButton fullWidth type="submit" disabled={!canSave}>저장</ActionButton>
        </form>
      </section>
    </div>
  )
}

export default CareMarkerBottomSheet

import ActionButton from '../ui/ActionButton.jsx'

function CheckInActions({ onLater }) {
  return (
    <div className="check-in-actions">
      <ActionButton variant="primary" fullWidth>
        그 시기 사진 넣기
      </ActionButton>
      <ActionButton variant="secondary" fullWidth onClick={onLater}>
        나중에
      </ActionButton>
    </div>
  )
}

export default CheckInActions

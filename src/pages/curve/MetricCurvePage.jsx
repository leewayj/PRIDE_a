import { useLocation, useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'

function MetricCurvePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isFirstAnalysis = location.state?.firstAnalysis === true

  return (
    <main className="app-shell">
      <h1>변화곡선</h1>
      {isFirstAnalysis && (
        <ActionButton onClick={() => navigate('/photos/analysis-complete', { replace: true })}>
          분석 완료하기
        </ActionButton>
      )}
    </main>
  )
}

export default MetricCurvePage

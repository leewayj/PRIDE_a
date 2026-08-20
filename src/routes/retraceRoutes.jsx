import { Route } from 'react-router-dom'
import BaselineVectorRegistrationPage from '../pages/onboarding/BaselineVectorRegistrationPage.jsx'
import MeasurementScopeNoticePage from '../pages/onboarding/MeasurementScopeNoticePage.jsx'
import PhotoUploadPage from '../pages/PhotoUploadPage.jsx'
import JudgementProgressPage from '../pages/judgement/JudgementProgressPage.jsx'
import JudgementSummaryPage from '../pages/judgement/JudgementSummaryPage.jsx'
import MetricCurvePage from '../pages/curve/MetricCurvePage.jsx'
import RewindPage from '../pages/curve/RewindPage.jsx'
import CompareTimePointsPage from '../pages/curve/CompareTimePointsPage.jsx'
import ChangeInterpretationPage from '../pages/curve/ChangeInterpretationPage.jsx'
import CareMarkersPage from '../pages/careMarkers/CareMarkersPage.jsx'
import CareEffectivenessPage from '../pages/careMarkers/CareEffectivenessPage.jsx'
import CheckInsPage from '../pages/CheckInsPage.jsx'
import DataInsufficientPage from '../pages/DataInsufficientPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import PhotosLayout from '../layouts/PhotosLayout.jsx'

/**
 * RETRACE의 추가 사용자 흐름을 App.jsx의 <Routes>에 연결하는 라우트 모음.
 * 아직 구현 전인 화면은 기존 placeholder 컴포넌트 연결을 유지한다.
 */
const retraceRoutes = (
  <>
    {/* 온보딩 - 측정범위고지 / 기준벡터등록 */}
    <Route path="/onboarding/measurement-scope" element={<MeasurementScopeNoticePage />} />
    <Route path="/onboarding/baseline-vector" element={<BaselineVectorRegistrationPage />} />

    {/* 사진업로드 */}
    <Route path="/photo-upload" element={<PhotoUploadPage />} />

    {/* 판정진행 */}
    <Route path="/judgement/progress" element={<JudgementProgressPage />} />

    {/* 변화곡선 / 되감기 / 시점비교 */}
    <Route path="/curve" element={<MetricCurvePage />} />
    <Route path="/curve/rewind" element={<RewindPage />} />
    <Route path="/curve/compare" element={<CompareTimePointsPage />} />
    <Route path="/curve/interpretation" element={<ChangeInterpretationPage />} />

    {/* 관리마커확인 / 관리효과판정 */}
    <Route path="/care-markers" element={<CareMarkersPage />} />
    <Route path="/care-markers/effectiveness" element={<CareEffectivenessPage />} />

    {/* 체크인 (기존 /check-in 화면과는 별개 노드) */}
    <Route path="/check-ins" element={<CheckInsPage />} />

    {/* 판정 결과 요약 / 데이터 부족 안내 (기존 분기 경로 유지) */}
    <Route element={<PhotosLayout />}>
      <Route path="/judgement/summary" element={<JudgementSummaryPage />} />
      <Route path="/re-measurement" element={<DataInsufficientPage />} />
    </Route>

    {/* 설정 */}
    <Route path="/settings" element={<SettingsPage />} />
  </>
)

export default retraceRoutes

import { Route } from 'react-router-dom'
import BaselineVectorRegistrationPage from '../pages/onboarding/BaselineVectorRegistrationPage.jsx'
import MeasurementScopeNoticePage from '../pages/onboarding/MeasurementScopeNoticePage.jsx'
import PhotoUploadPage from '../pages/PhotoUploadPage.jsx'
import JudgementProgressPage from '../pages/judgement/JudgementProgressPage.jsx'
import JudgementSummaryPage from '../pages/judgement/JudgementSummaryPage.jsx'
import MetricCurvePage from '../pages/curve/MetricCurvePage.jsx'
import RewindPage from '../pages/curve/RewindPage.jsx'
import CompareTimePointsPage from '../pages/curve/CompareTimePointsPage.jsx'
import CareMarkersPage from '../pages/careMarkers/CareMarkersPage.jsx'
import CareEffectivenessPage from '../pages/careMarkers/CareEffectivenessPage.jsx'
import CheckInsPage from '../pages/CheckInsPage.jsx'
import DataInsufficientPage from '../pages/DataInsufficientPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import PhotosLayout from '../layouts/PhotosLayout.jsx'

/**
 * 유저플로우 문서의 화면 노드 중 아직 실제 화면이 없는 라우트 골격.
 * 각 라우트는 화면 제목만 표시하는 placeholder 컴포넌트로 연결되어 있다.
 * 기존 홈/온보딩/사진/변화 라우트는 건드리지 않고, App.jsx의 <Routes> 안에
 * 이 조각을 그대로 이어 붙이기만 하면 되도록 구성했다.
 */
const retraceRoutes = (
  <>
    {/* 온보딩 - 측정범위고지 / 기준벡터등록 */}
    <Route path="/onboarding/measurement-scope" element={<MeasurementScopeNoticePage />} />
    <Route path="/onboarding/baseline-vector" element={<BaselineVectorRegistrationPage />} />

    {/* 사진업로드 */}
    <Route path="/photo-upload" element={<PhotoUploadPage />} />

    {/* 판정진행 / 판정결과요약 */}
    <Route path="/judgement/progress" element={<JudgementProgressPage />} />
    <Route path="/judgement/summary" element={<JudgementSummaryPage />} />

    {/* 변화곡선 / 되감기 / 시점비교 */}
    <Route path="/curve" element={<MetricCurvePage />} />
    <Route path="/curve/rewind" element={<RewindPage />} />
    <Route path="/curve/compare" element={<CompareTimePointsPage />} />

    {/* 관리마커확인 / 관리효과판정 */}
    <Route path="/care-markers" element={<CareMarkersPage />} />
    <Route path="/care-markers/effectiveness" element={<CareEffectivenessPage />} />

    {/* 체크인 (기존 /check-in 화면과는 별개 노드) */}
    <Route path="/check-ins" element={<CheckInsPage />} />

    {/* 데이터 부족 안내 (기존 분기 경로 유지) */}
    <Route element={<PhotosLayout />}>
      <Route path="/re-measurement" element={<DataInsufficientPage />} />
    </Route>

    {/* 설정 */}
    <Route path="/settings" element={<SettingsPage />} />
  </>
)

export default retraceRoutes

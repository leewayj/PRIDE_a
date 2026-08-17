import ActionButton from '../ui/ActionButton.jsx'
import SectionTitle from '../ui/SectionTitle.jsx'
import StepCard from './StepCard.jsx'

const steps = [
  {
    step: 1,
    title: '사진 업로드',
    description: (
      <>
        갤러리에 이미 있는 사진을
        <br />
        골라 넣습니다
      </>
    ),
  },
  {
    step: 2,
    title: '사진 선별',
    description: (
      <>
        다른 사람 얼굴과
        <br />
        흐린 사진을 걸러냅니다
      </>
    ),
  },
  {
    step: 3,
    title: '변화 확인',
    description: (
      <>
        선별된 사진을 기준으로
        <br />
        시간별 변화를 확인합니다
      </>
    ),
  },
]

function HowItWorks() {
  return (
    <section className="how-it-works">
      <SectionTitle>How It Works</SectionTitle>

      <div className="how-it-works__steps">
        {steps.map((item) => (
          <StepCard key={item.step} {...item} />
        ))}
      </div>

      <ActionButton
        className="how-it-works__upload"
        variant="outline"
        fullWidth
      >
        사진 업로드하기 →
      </ActionButton>
    </section>
  )
}

export default HowItWorks

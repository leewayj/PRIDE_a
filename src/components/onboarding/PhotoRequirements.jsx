const requirements = [
  '얼굴이 정면을 향한 사진',
  '얼굴 전체가 선명하게 나온 사진',
  '서로 다른 시기에 촬영한 사진',
]

function PhotoRequirements() {
  return (
    <section className="photo-requirements" aria-labelledby="photo-requirements-title">
      <h2 id="photo-requirements-title">사진 선택 조건</h2>
      <ul>
        {requirements.map((requirement) => (
          <li key={requirement}>
            <span aria-hidden="true">✓</span>
            {requirement}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PhotoRequirements

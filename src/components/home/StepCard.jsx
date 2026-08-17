function StepCard({ step, title, description }) {
  return (
    <article className="step-card">
      <div className="step-card__image" aria-hidden="true" />
      <span className="step-card__number">Step {step}.</span>
      <h3 className="step-card__title">{title}</h3>
      <p className="step-card__description">{description}</p>
    </article>
  )
}

export default StepCard

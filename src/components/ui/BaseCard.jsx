function BaseCard({ children, className = '', ...props }) {
  const classes = ['base-card', className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default BaseCard

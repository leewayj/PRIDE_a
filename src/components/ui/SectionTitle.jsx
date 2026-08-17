function SectionTitle({ children, className = '', ...props }) {
  const classes = ['section-title', className].filter(Boolean).join(' ')

  return (
    <h2 className={classes} {...props}>
      {children}
    </h2>
  )
}

export default SectionTitle

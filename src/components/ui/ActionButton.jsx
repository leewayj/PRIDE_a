import { forwardRef } from 'react'

const ActionButton = forwardRef(function ActionButton({
  children,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className = '',
  disabled = false,
  ...props
}, ref) {
  const classes = [
    'action-button',
    `action-button--${variant}`,
    fullWidth && 'action-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      className={classes}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export default ActionButton

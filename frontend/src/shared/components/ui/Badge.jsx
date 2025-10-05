import clsx from 'clsx'

const variants = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-accent/10 text-secondary',
}

export default function Badge({ variant = 'info', className, children }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

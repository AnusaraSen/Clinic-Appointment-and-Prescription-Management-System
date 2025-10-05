import clsx from 'clsx'

const variants = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110',
  secondary: 'bg-secondary text-secondary-foreground hover:brightness-110',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
}

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-[12px] px-4 py-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

import clsx from 'clsx'

export default function Card({ className, children }) {
  return (
    <div className={clsx('bg-surface rounded-[14px] shadow-md', className)}>
      {children}
    </div>
  )
}

import clsx from 'clsx'

export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx('w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent', className)}
      {...props}
    />
  )
}

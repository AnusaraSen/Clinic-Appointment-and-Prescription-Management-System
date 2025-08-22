import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/appointments', label: 'Appointments', icon: '📅' },
  { to: '/prescriptions', label: 'Prescriptions', icon: '💊' },
  { to: '/patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
  { to: '/doctors', label: 'Doctors', icon: '🩺' },
  { to: '/pharmacists', label: 'Pharmacists', icon: '�' },
  { to: '/lab-assistants', label: 'Lab Assistants', icon: '🧪' },
  { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-gray-800 flex">
      <aside className="hidden md:flex md:flex-col w-64 bg-secondary text-white">
        <div className="h-16 px-4 flex items-center text-lg font-semibold tracking-wide border-b border-white/10">
          MediClinic Admin
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-accent text-secondary-foreground' : 'hover:bg-white/10 text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-surface card-shadow flex items-center justify-between px-4 md:px-6">
          <div className="hidden md:block w-full max-w-xl">
            <div className="relative">
              <input
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-secondary font-semibold">DA</div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}



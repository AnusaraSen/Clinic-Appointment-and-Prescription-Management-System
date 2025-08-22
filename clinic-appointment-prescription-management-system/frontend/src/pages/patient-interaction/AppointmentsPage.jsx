import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'

const initialAppointments = [
  { id: 'APT-1001', patient: 'Jane Doe', doctor: 'Dr. Adams', date: '2025-08-21 10:30', status: 'Scheduled' },
  { id: 'APT-1002', patient: 'Mark Lee', doctor: 'Dr. Kim', date: '2025-08-21 11:15', status: 'Checked-in' },
]

export default function AppointmentsPage() {
  const [items, setItems] = useState(initialAppointments)
  const [term, setTerm] = useState('')

  const filtered = useMemo(() => items.filter(a => a.patient.toLowerCase().includes(term.toLowerCase())), [items, term])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary">Appointments</h1>
        <Button>+ New Appointment</Button>
      </div>
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Input placeholder="Search by patient..." value={term} onChange={(e) => setTerm(e.target.value)} className="md:max-w-xs" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Doctor</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">{a.id}</td>
                  <td className="px-3 py-3">{a.patient}</td>
                  <td className="px-3 py-3">{a.doctor}</td>
                  <td className="px-3 py-3">{a.date}</td>
                  <td className="px-3 py-3"><Badge variant="info">{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

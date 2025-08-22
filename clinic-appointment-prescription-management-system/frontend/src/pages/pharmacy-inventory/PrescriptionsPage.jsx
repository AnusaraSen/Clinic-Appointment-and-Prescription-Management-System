import { useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'

const initial = [
  { id: 'RX-2001', patient: 'Jane Doe', drug: 'Amoxicillin', dosage: '500mg', status: 'Pending' },
  { id: 'RX-2002', patient: 'Sam Fox', drug: 'Ibuprofen', dosage: '200mg', status: 'Dispensed' },
]

export default function PrescriptionsPage() {
  const [items] = useState(initial)
  const [term, setTerm] = useState('')

  const filtered = items.filter(x => x.patient.toLowerCase().includes(term.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary">Prescriptions</h1>
        <Button variant="secondary">+ New Prescription</Button>
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
                <th className="px-3 py-3">Drug</th>
                <th className="px-3 py-3">Dosage</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">{x.id}</td>
                  <td className="px-3 py-3">{x.patient}</td>
                  <td className="px-3 py-3">{x.drug}</td>
                  <td className="px-3 py-3">{x.dosage}</td>
                  <td className="px-3 py-3"><Badge variant={x.status === 'Dispensed' ? 'success' : 'warning'}>{x.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

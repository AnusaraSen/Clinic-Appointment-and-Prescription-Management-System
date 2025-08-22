import { useMemo, useState } from 'react'

const initialData = [
  {
    id: 'REQ-1001',
    description: 'Air conditioner not working in Room 204',
    location: 'Ward B - Room 204',
    priority: 'High',
    requestedBy: 'Nurse Alice',
    assignedTo: 'John Doe',
    status: 'Open',
    createdAt: '2025-08-15 09:30',
  },
  {
    id: 'REQ-1002',
    description: 'Broken light in Lab 2',
    location: 'Laboratory 2',
    priority: 'Medium',
    requestedBy: 'Dr. Kim',
    assignedTo: 'Sara Smith',
    status: 'In Progress',
    createdAt: '2025-08-16 14:05',
  },
]

const priorities = ['All', 'Low', 'Medium', 'High']
const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

export default function MaintenancePage() {
  const [requests, setRequests] = useState(initialData)
  const [filters, setFilters] = useState({ priority: 'All', status: 'All' })
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ description: '', location: '', priority: 'Medium', requestedBy: '', assignedTo: '' })
  const [viewItem, setViewItem] = useState(null)

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const byPriority = filters.priority === 'All' || r.priority === filters.priority
      const byStatus = filters.status === 'All' || r.status === filters.status
      return byPriority && byStatus
    })
  }, [requests, filters])

  function resetForm() {
    setForm({ description: '', location: '', priority: 'Medium', requestedBy: '', assignedTo: '' })
  }

  function handleAdd(e) {
    e?.preventDefault()
    const newItem = {
      id: `REQ-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: form.description,
      location: form.location,
      priority: form.priority,
      requestedBy: form.requestedBy,
      assignedTo: form.assignedTo,
      status: 'Open',
      createdAt: new Date().toLocaleString(),
    }
    setRequests((prev) => [newItem, ...prev])
    setModalOpen(false)
    resetForm()
  }

  function handleDelete(id) {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  function handleEdit(item) {
    setModalOpen(true)
    setForm({ description: item.description, location: item.location, priority: item.priority, requestedBy: item.requestedBy, assignedTo: item.assignedTo })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary">Maintenance Management</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2 rounded-lg card-shadow">
          + Add New Request
        </button>
      </div>

      <div className="bg-surface rounded-card card-shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p} Priority</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s} Status</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">Request ID</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Requested By</th>
                <th className="px-3 py-3">Assigned To</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created At</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">{item.id}</td>
                  <td className="px-3 py-3 max-w-md">{item.description}</td>
                  <td className="px-3 py-3">{item.location}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'High' ? 'bg-danger/10 text-danger' : item.priority === 'Low' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3">{item.requestedBy}</td>
                  <td className="px-3 py-3">{item.assignedTo}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Open' ? 'bg-accent/10 text-secondary' : item.status === 'In Progress' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">{item.createdAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="px-3 py-1 rounded-md btn-outline">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded-md text-white bg-danger hover:bg-red-600">Delete</button>
                      <button onClick={() => setViewItem(item)} className="px-3 py-1 rounded-md bg-background border border-gray-200 hover:bg-gray-100">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl bg-surface rounded-card card-shadow">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-secondary">Add Maintenance Request</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent">
                  {['Low', 'Medium', 'High'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requested By</label>
                <input required value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-background border border-gray-200 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg btn-primary">Save Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl bg-surface rounded-card card-shadow">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-secondary">Request Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <DetailRow label="Request ID" value={viewItem.id} />
              <DetailRow label="Description" value={viewItem.description} />
              <DetailRow label="Location" value={viewItem.location} />
              <DetailRow label="Priority" value={viewItem.priority} />
              <DetailRow label="Requested By" value={viewItem.requestedBy} />
              <DetailRow label="Assigned To" value={viewItem.assignedTo} />
              <DetailRow label="Status" value={viewItem.status} />
              <DetailRow label="Created At" value={viewItem.createdAt} />
            </div>
            <div className="p-4 pt-0 flex justify-end">
              <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-lg btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  )
}



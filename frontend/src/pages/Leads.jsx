import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Trash2, Eye, Edit2, X, Check } from 'lucide-react'
import { getLeads, createLead, updateLead, deleteLead } from '../services/api'
import { PriorityBadge, StatusBadge, ScoreBadge, PageHeader, EmptyState, LoadingSpinner } from '../components/ui'
import { Link } from 'react-router-dom'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']
const PRIORITIES = ['HOT', 'WARM', 'COLD']

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || {
    name: '', email: '', phone: '', company: '', industry: '',
    budget: '', requirements: '', status: 'New', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.company || !form.requirements) {
      setError('Name, email, company and requirements are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (lead?.id) {
        const r = await updateLead(lead.id, form)
        onSave(r.data.lead)
      } else {
        const r = await createLead(form)
        onSave(r.data.lead)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save lead')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{lead?.id ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1-555-0100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input className="input-field" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input className="input-field" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="SaaS / Technology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input className="input-field" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="$10,000 - $50,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
            <textarea className="input-field" rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Describe what the customer needs…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><LoadingSpinner size="sm" /> Saving…</> : <><Check className="w-4 h-4" /> {lead?.id ? 'Update Lead' : 'Create Lead'}</>}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | lead object
  const [deleting, setDeleting] = useState(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLeads({ search, priority: filterPriority, status: filterStatus })
      setLeads(r.data.leads || [])
    } catch {}
    setLoading(false)
  }, [search, filterPriority, filterStatus])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    setDeleting(id)
    try {
      await deleteLead(id)
      setLeads(l => l.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const handleSave = (lead) => {
    setLeads(prev => {
      const idx = prev.findIndex(l => l.id === lead.id)
      if (idx >= 0) { const copy = [...prev]; copy[idx] = lead; return copy }
      return [lead, ...prev]
    })
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} leads total`}
        action={
          <button className="btn-primary" onClick={() => setModal('add')}>
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search leads…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field w-40" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="input-field w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterPriority || filterStatus) && (
          <button className="btn-secondary" onClick={() => { setSearch(''); setFilterPriority(''); setFilterStatus('') }}>
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <LoadingSpinner /> <span className="text-gray-500 text-sm">Loading leads…</span>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState icon={Search} title="No leads found" description="Try adjusting your filters or add a new lead." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Lead</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Company</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">AI Score</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Budget</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {lead.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{lead.company}</p>
                      <p className="text-xs text-gray-500">{lead.industry}</p>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-4"><PriorityBadge priority={lead.priority} /></td>
                    <td className="px-4 py-4"><ScoreBadge score={lead.ai_score} /></td>
                    <td className="px-4 py-4 text-sm text-gray-600">{lead.budget || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/leads/${lead.id}`} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => setModal(lead)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete">
                          {deleting === lead.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <LeadModal
          lead={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

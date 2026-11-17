import { useState, useEffect } from 'react'
import { Mail, Copy, Check, Zap } from 'lucide-react'
import { getLeads, generateFollowup } from '../services/api'
import { PriorityBadge, DemoBanner, LoadingSpinner, PageHeader } from '../components/ui'

const PRIORITIES = ['HOT', 'WARM', 'COLD']

export default function FollowUps() {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState({
    name: '', company: '', requirements: '', priority: 'WARM',
    previous_interaction: '', next_action: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [selectedLead, setSelectedLead] = useState('')

  useEffect(() => {
    getLeads().then(r => setLeads(r.data.leads || [])).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fillFromLead = (leadId) => {
    setSelectedLead(leadId)
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setForm({
        name: lead.name,
        company: lead.company,
        requirements: lead.requirements,
        priority: lead.priority || 'WARM',
        previous_interaction: lead.notes || '',
        next_action: ''
      })
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.company || !form.requirements) {
      setError('Name, company and requirements are required.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const r = await generateFollowup(form)
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed. Check if the backend is running.')
    }
    setLoading(false)
  }

  const copyEmail = () => {
    if (!result?.followup) return
    const { subject, message } = result.followup
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${message}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8">
      <PageHeader
        title="AI Follow-up Generator"
        subtitle="Generate personalized, context-aware follow-up emails using Gemini AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Follow-up Details</h2>
          </div>

          {/* Quick fill from leads */}
          {leads.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Quick fill from existing lead</label>
              <select className="input-field" value={selectedLead} onChange={e => fillFromLead(e.target.value)}>
                <option value="">Select a lead…</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
              </select>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                <input className="input-field" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    onClick={() => set('priority', p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.priority === p ? (p === 'HOT' ? 'bg-red-100 text-red-700 border-red-300' : p === 'WARM' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-blue-100 text-blue-700 border-blue-300') : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {p === 'HOT' ? '🔥' : p === 'WARM' ? '☀️' : '❄️'} {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Requirements *</label>
              <textarea className="input-field" rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="What does this customer need?" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Previous Interaction</label>
              <textarea className="input-field" rows={2} value={form.previous_interaction} onChange={e => set('previous_interaction', e.target.value)} placeholder="What was discussed in previous conversations?" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Recommended Next Action</label>
              <input className="input-field" value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="e.g. Schedule a demo call" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><LoadingSpinner size="sm" /> Generating…</> : <><Zap className="w-4 h-4" /> Generate Follow-up Email</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {loading && (
            <div className="card p-10 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Crafting your follow-up…</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4">
              <DemoBanner show={result.demo_mode} />
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Generated Email</h3>
                    <PriorityBadge priority={form.priority} />
                  </div>
                  <button onClick={copyEmail} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Email</>}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-xs text-gray-500 mb-1 font-medium">SUBJECT</p>
                  <p className="text-sm font-semibold text-gray-900">{result.followup?.subject}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">MESSAGE</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.followup?.message}</pre>
                </div>
                {result.followup?.call_to_action && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 font-medium">Call to Action: <span className="text-indigo-900">{result.followup.call_to_action}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}
          {!result && !loading && (
            <div className="card p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Email Will Appear Here</h3>
              <p className="text-sm text-gray-500">Fill in the details and click Generate to create a personalized follow-up email tailored to your lead's context and priority.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

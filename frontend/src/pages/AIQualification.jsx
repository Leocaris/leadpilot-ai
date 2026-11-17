import { useState } from 'react'
import { Zap, Save, CheckCircle } from 'lucide-react'
import { qualifyLead, createLead } from '../services/api'
import { PriorityBadge, DemoBanner, LoadingSpinner, PageHeader } from '../components/ui'

export default function AIQualification() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    industry: '', budget: '', requirements: '', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleQualify = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.company || !form.requirements) {
      setError('Name, email, company and requirements are required.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    setSaved(false)
    try {
      const r = await qualifyLead({ ...form, save_to_db: false })
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Qualification failed. Check if the backend is running.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!result) return
    try {
      await createLead({
        ...form,
        ai_score: result.qualification.score,
        priority: result.qualification.priority,
      })
      setSaved(true)
    } catch (err) {
      setError('Failed to save lead')
    }
  }

  const q = result?.qualification

  const scoreColor = (s) => s >= 75 ? 'text-green-600' : s >= 40 ? 'text-amber-600' : 'text-red-600'
  const scoreRing = (s) => s >= 75 ? 'border-green-400' : s >= 40 ? 'border-amber-400' : 'border-red-400'

  return (
    <div className="p-8">
      <PageHeader
        title="AI Lead Qualification"
        subtitle="Let Gemini AI analyze your lead and generate a qualification score"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Lead Information</h2>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
          <form onSubmit={handleQualify} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                <input className="input-field" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                <input className="input-field" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="SaaS / Technology" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                <input className="input-field" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="$50,000 - $100,000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1-555-0100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Requirements *</label>
              <textarea className="input-field" rows={4} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Describe what the customer needs in detail…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Previous interactions, urgency, special context…" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading
                ? <><LoadingSpinner size="sm" /> Analyzing with Gemini AI…</>
                : <><Zap className="w-4 h-4" /> Qualify Lead with AI</>
              }
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {loading && (
            <div className="card p-10 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">Analyzing Lead…</p>
                <p className="text-sm text-gray-500 mt-1">Gemini AI is processing the lead information</p>
              </div>
            </div>
          )}

          {q && !loading && (
            <div className="space-y-4">
              <DemoBanner show={result?.demo_mode} />

              {/* Score card */}
              <div className="card p-6 text-center">
                <div className={`w-28 h-28 rounded-full border-8 ${scoreRing(q.score)} mx-auto flex items-center justify-center mb-3`}>
                  <span className={`text-4xl font-black ${scoreColor(q.score)}`}>{q.score}</span>
                </div>
                <div className="text-sm text-gray-500 mb-3">AI Qualification Score</div>
                <PriorityBadge priority={q.priority} />
                <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
                  <span>Urgency: <strong>{q.urgency_level}</strong></span>
                  <span>Est. Deal: <strong>{q.estimated_deal_size || '—'}</strong></span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reasoning</p>
                <p className="text-sm text-gray-700">{q.reasoning}</p>
              </div>

              {/* Strengths & concerns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <p className="text-xs font-semibold text-green-700 mb-2">✅ Key Strengths</p>
                  <ul className="space-y-1.5">
                    {q.key_strengths?.map((s, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-green-500 flex-shrink-0">•</span>{s}</li>)}
                  </ul>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-semibold text-red-700 mb-2">⚠️ Concerns</p>
                  <ul className="space-y-1.5">
                    {q.concerns?.map((c, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-red-400 flex-shrink-0">•</span>{c}</li>)}
                  </ul>
                </div>
              </div>

              {/* Next action */}
              <div className="card p-4 bg-indigo-50 border-indigo-200">
                <p className="text-xs font-semibold text-indigo-700 mb-1">🎯 Recommended Next Action</p>
                <p className="text-sm text-indigo-900">{q.next_action}</p>
              </div>

              {/* Save button */}
              <button onClick={handleSave} disabled={saved} className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-50 text-green-700 border border-green-200' : 'btn-primary'}`}>
                {saved ? <><CheckCircle className="w-4 h-4" /> Saved to CRM!</> : <><Save className="w-4 h-4" /> Save Lead to CRM</>}
              </button>
            </div>
          )}

          {!q && !loading && (
            <div className="card p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Qualification Ready</h3>
              <p className="text-sm text-gray-500">Fill in the lead details and click "Qualify Lead with AI" to get an instant score, classification, and next-action recommendation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

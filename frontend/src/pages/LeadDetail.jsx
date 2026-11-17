import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Zap, Mail, Phone, Building, DollarSign, FileText, Edit2 } from 'lucide-react'
import { getLead, qualifyLead, generateFollowup } from '../services/api'
import { PriorityBadge, StatusBadge, ScoreBadge, DemoBanner, LoadingSpinner } from '../components/ui'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)
  const [qualification, setQualification] = useState(null)
  const [followupLoading, setFollowupLoading] = useState(false)
  const [followup, setFollowup] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getLead(id).then(r => { setLead(r.data.lead); setLoading(false) }).catch(() => navigate('/leads'))
  }, [id])

  const handleQualify = async () => {
    if (!lead) return
    setQualifying(true)
    try {
      const r = await qualifyLead({ name: lead.name, email: lead.email, company: lead.company, industry: lead.industry, budget: lead.budget, requirements: lead.requirements, notes: lead.notes })
      setQualification(r.data)
    } catch (err) { alert('Qualification failed') }
    setQualifying(false)
  }

  const handleFollowup = async () => {
    if (!lead) return
    setFollowupLoading(true)
    try {
      const r = await generateFollowup({
        name: lead.name, company: lead.company, requirements: lead.requirements,
        priority: lead.priority || qualification?.qualification?.priority || 'WARM',
        previous_interaction: lead.notes, next_action: qualification?.qualification?.next_action || ''
      })
      setFollowup(r.data.followup)
    } catch (err) { alert('Follow-up generation failed') }
    setFollowupLoading(false)
  }

  const copyEmail = () => {
    if (followup?.message) {
      navigator.clipboard.writeText(`Subject: ${followup.subject}\n\n${followup.message}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><LoadingSpinner size="lg" /></div>
  if (!lead) return <div className="p-8 text-gray-500">Lead not found</div>

  const q = qualification?.qualification

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/leads" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-sm text-gray-500">{lead.company} • {lead.industry}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Lead Info */}
        <div className="card p-5 col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Mail, label: 'Email', value: lead.email },
              { icon: Phone, label: 'Phone', value: lead.phone || '—' },
              { icon: Building, label: 'Company', value: lead.company },
              { icon: DollarSign, label: 'Budget', value: lead.budget || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm text-gray-900 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Requirements</p>
                <p className="text-sm text-gray-900 mt-0.5">{lead.requirements}</p>
              </div>
            </div>
          </div>
          {lead.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Score card */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">AI Score</h3>
          <div className="text-center py-4">
            <div className="text-5xl font-black text-gray-900 mb-2">
              {q?.score ?? lead.ai_score ?? '—'}
            </div>
            <div className="text-sm text-gray-500 mb-3">/ 100</div>
            <PriorityBadge priority={q?.priority || lead.priority} />
            {q?.urgency_level && <p className="text-xs text-gray-500 mt-2">Urgency: {q.urgency_level}</p>}
          </div>
          <button onClick={handleQualify} disabled={qualifying} className="btn-primary w-full justify-center mt-2">
            {qualifying ? <><LoadingSpinner size="sm" /> Qualifying…</> : <><Zap className="w-4 h-4" /> Run AI Qualification</>}
          </button>
        </div>
      </div>

      {/* Qualification Result */}
      {q && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">AI Qualification Report</h3>
            {qualification?.demo_mode && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo</span>}
          </div>
          <DemoBanner show={qualification?.demo_mode} />
          <p className="text-sm text-gray-700 mt-3 mb-4">{q.reasoning}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-2">✅ Strengths</p>
              <ul className="space-y-1">{q.key_strengths?.map((s, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 mb-2">⚠️ Concerns</p>
              <ul className="space-y-1">{q.concerns?.map((c, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-red-400">•</span>{c}</li>)}</ul>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Next Action</p>
            <p className="text-sm text-indigo-900">{q.next_action}</p>
          </div>
        </div>
      )}

      {/* Follow-up */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">AI Follow-up Email</h3>
          </div>
          <button onClick={handleFollowup} disabled={followupLoading} className="btn-secondary text-sm">
            {followupLoading ? <><LoadingSpinner size="sm" /> Generating…</> : 'Generate Follow-up'}
          </button>
        </div>
        {followup ? (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <p className="text-sm font-semibold text-gray-900">{followup.subject}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <p className="text-xs text-gray-500 mb-2">Message</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{followup.message}</pre>
            </div>
            <button onClick={copyEmail} className="btn-primary text-sm">
              {copied ? '✓ Copied!' : '📋 Copy Email'}
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">Click "Generate Follow-up" to create a personalized email for this lead.</p>
        )}
      </div>
    </div>
  )
}

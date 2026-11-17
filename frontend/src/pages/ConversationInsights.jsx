import { useState } from 'react'
import { MessageSquare, Zap, TrendingUp } from 'lucide-react'
import { summarizeConversation } from '../services/api'
import { DemoBanner, LoadingSpinner, PageHeader } from '../components/ui'

const SAMPLE = `Sales Rep: Hi Sarah, thanks for reaching out! You mentioned you're looking for a CRM solution?

Customer: Yes, we're a B2B SaaS company with about 50 sales reps. Our current CRM is Salesforce but it's become too expensive and complex for our team.

Sales Rep: What are your main pain points with Salesforce?

Customer: The admin overhead is huge - we spend more time managing the system than selling. Also, we need better AI-powered lead scoring. Our conversion rate has dropped 15% this year because reps don't know which leads to prioritize.

Sales Rep: What's your budget looking like for a new solution?

Customer: We're looking at $30,000-$50,000 annually. We also need it to integrate with our HubSpot marketing setup and Slack.

Sales Rep: When are you looking to make a decision?

Customer: We're evaluating vendors this quarter. Our contract with Salesforce expires in 3 months so there's some urgency.`

export default function ConversationInsights() {
  const [form, setForm] = useState({
    conversation: '', customer_name: '', company: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!form.conversation || form.conversation.trim().length < 20) {
      setError('Please provide a conversation with at least 20 characters.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const r = await summarizeConversation(form)
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Check if the backend is running.')
    }
    setLoading(false)
  }

  const intentColor = (intent) => ({
    High: 'text-green-700 bg-green-100',
    Medium: 'text-amber-700 bg-amber-100',
    Low: 'text-red-700 bg-red-100',
  }[intent] || 'text-gray-700 bg-gray-100')

  const sentimentColor = (s) => ({
    Positive: 'text-green-700 bg-green-100',
    Neutral: 'text-gray-700 bg-gray-100',
    Negative: 'text-red-700 bg-red-100',
  }[s] || 'text-gray-700 bg-gray-100')

  return (
    <div className="p-8">
      <PageHeader
        title="Conversation Insights"
        subtitle="Extract requirements, pain points and buying intent from customer conversations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Customer Conversation</h2>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                <input className="input-field" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Sarah Mitchell" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                <input className="input-field" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">Conversation Notes *</label>
                <button type="button" onClick={() => set('conversation', SAMPLE)} className="text-xs text-indigo-600 hover:text-indigo-700">Load sample</button>
              </div>
              <textarea
                className="input-field"
                rows={12}
                value={form.conversation}
                onChange={e => set('conversation', e.target.value)}
                placeholder="Paste the customer conversation, meeting notes, or call transcript here…"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><LoadingSpinner size="sm" /> Analyzing…</> : <><Zap className="w-4 h-4" /> Extract Insights</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {loading && (
            <div className="card p-10 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Analyzing conversation…</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4">
              <DemoBanner show={result.demo_mode} />
              {/* Summary */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${intentColor(result.summary?.buying_intent)}`}>
                    Buying Intent: {result.summary?.buying_intent}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sentimentColor(result.summary?.sentiment)}`}>
                    {result.summary?.sentiment}
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-700">{result.summary?.summary}</p>
              </div>
              {/* Requirements */}
              <div className="card p-5">
                <h4 className="font-medium text-gray-900 mb-3">📋 Customer Requirements</h4>
                <ul className="space-y-1.5">
                  {result.summary?.requirements?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-500 font-bold mt-0.5">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Pain points */}
              <div className="card p-5">
                <h4 className="font-medium text-gray-900 mb-3">😤 Pain Points</h4>
                <ul className="space-y-1.5">
                  {result.summary?.pain_points?.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 font-bold mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Next steps */}
              <div className="card p-5 bg-indigo-50 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-medium text-indigo-900">Recommended Next Steps</h4>
                </div>
                <ol className="space-y-1.5">
                  {result.summary?.next_steps?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                      <span className="font-bold text-indigo-500 flex-shrink-0">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          {!result && !loading && (
            <div className="card p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Insights Will Appear Here</h3>
              <p className="text-sm text-gray-500">Paste a customer conversation and AI will extract requirements, pain points, buying intent, and actionable next steps.</p>
              <button onClick={() => set('conversation', SAMPLE)} className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Load sample conversation →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

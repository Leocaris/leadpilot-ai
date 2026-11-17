export function PriorityBadge({ priority }) {
  const map = {
    HOT: 'badge-hot',
    WARM: 'badge-warm',
    COLD: 'badge-cold',
  }
  const labels = { HOT: '🔥 HOT', WARM: '☀️ WARM', COLD: '❄️ COLD' }
  if (!priority) return <span className="text-gray-400 text-xs">—</span>
  return (
    <span className={map[priority?.toUpperCase()] || 'badge-cold'}>
      {labels[priority?.toUpperCase()] || priority}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    New: 'bg-gray-100 text-gray-700',
    Contacted: 'bg-blue-100 text-blue-700',
    Qualified: 'bg-indigo-100 text-indigo-700',
    Proposal: 'bg-purple-100 text-purple-700',
    Won: 'bg-green-100 text-green-700',
    Lost: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'Unknown'}
    </span>
  )
}

export function ScoreBadge({ score }) {
  if (score == null) return <span className="text-gray-400 text-xs">N/A</span>
  const color = score >= 75 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
  return <span className={`font-bold text-sm ${color}`}>{score}/100</span>
}

export function DemoBanner({ show, message }) {
  if (!show) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm">
      <span className="text-amber-500 mt-0.5">⚠️</span>
      <div>
        <span className="font-semibold text-amber-800">Demo Mode — </span>
        <span className="text-amber-700">{message || 'AI response shown is sample data. Configure GEMINI_API_KEY for live AI.'}</span>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className={`${s} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-gray-900 font-semibold mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Users, Flame, Thermometer, Snowflake, TrendingUp, ArrowUpRight, Zap } from 'lucide-react'
import { getLeads } from '../services/api'
import { PriorityBadge, StatusBadge, ScoreBadge } from '../components/ui'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = { HOT: '#ef4444', WARM: '#f59e0b', COLD: '#3b82f6', null: '#94a3b8' }

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeads().then(r => {
      setLeads(r.data.leads || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const hot = leads.filter(l => l.priority === 'HOT').length
  const warm = leads.filter(l => l.priority === 'WARM').length
  const cold = leads.filter(l => l.priority === 'COLD').length
  const won = leads.filter(l => l.status === 'Won').length
  const convRate = leads.length ? Math.round((won / leads.length) * 100) : 0

  const pieData = [
    { name: 'HOT', value: hot },
    { name: 'WARM', value: warm },
    { name: 'COLD', value: cold },
  ].filter(d => d.value > 0)

  const statusData = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'].map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
  }))

  const recent = leads.slice(0, 5)

  const aiActivity = [
    { time: '2 min ago', action: 'Lead qualified', detail: 'Sarah Mitchell → HOT (92/100)', color: 'bg-red-100 text-red-600' },
    { time: '15 min ago', action: 'Follow-up generated', detail: 'David Blackwood — Enterprise proposal email', color: 'bg-indigo-100 text-indigo-600' },
    { time: '1 hr ago', action: 'Conversation summarized', detail: 'Raj Patel — SAP integration discussion', color: 'bg-purple-100 text-purple-600' },
    { time: '3 hr ago', action: 'Lead qualified', detail: 'Ana Rodriguez → HOT (84/100)', color: 'bg-red-100 text-red-600' },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your AI-powered CRM at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Leads" value={leads.length} sub="All time" color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Flame} label="Hot Leads" value={hot} sub="High priority" color="bg-red-50 text-red-600" />
        <StatCard icon={Thermometer} label="Warm Leads" value={warm} sub="Nurturing stage" color="bg-amber-50 text-amber-600" />
        <StatCard icon={Snowflake} label="Cold Leads" value={cold} sub="Need engagement" color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Bar chart */}
        <div className="card p-5 col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Leads</h3>
            <a href="/leads" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</a>
          </div>
          <div className="space-y-3">
            {recent.map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={lead.priority} />
                  <ScoreBadge score={lead.ai_score} />
                </div>
              </div>
            ))}
            {recent.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No leads yet</p>}
          </div>
        </div>

        {/* AI Activity */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Recent AI Activity</h3>
          </div>
          <div className="space-y-3">
            {aiActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${item.color}`}>
                  {item.action}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{item.detail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">{convRate}% conversion rate</span>
            </div>
            <p className="text-xs text-indigo-600 mt-0.5">{won} of {leads.length} leads converted to Won</p>
          </div>
        </div>
      </div>
    </div>
  )
}

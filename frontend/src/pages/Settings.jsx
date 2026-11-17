import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Server, Brain, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { checkHealth } from '../services/api'

export default function Settings() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const r = await checkHealth()
      setHealth(r.data)
    } catch {
      setHealth({ status: 'unreachable', database: 'unknown', ai: 'unknown' })
    }
    setLoading(false)
  }

  useEffect(() => { fetchHealth() }, [])

  const StatusIcon = ({ ok }) => ok
    ? <CheckCircle className="w-5 h-5 text-green-500" />
    : <XCircle className="w-5 h-5 text-red-400" />

  const isOk = (val) => val && val !== 'unknown' && val !== 'unreachable' && !val.includes('demo') && val !== 'demo_mode'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">System configuration and status</p>
      </div>

      {/* Health check */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">System Status</h2>
          </div>
          <button onClick={fetchHealth} disabled={loading} className="btn-secondary text-sm">
            {loading ? 'Checking…' : <><RefreshCw className="w-4 h-4" /> Check Status</>}
          </button>
        </div>
        {health && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Backend API</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon ok={health.status === 'healthy'} />
                <span className={`text-sm font-medium ${health.status === 'healthy' ? 'text-green-600' : 'text-red-500'}`}>
                  {health.status === 'healthy' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon ok={isOk(health.database)} />
                <span className={`text-sm font-medium ${isOk(health.database) ? 'text-green-600' : 'text-amber-600'}`}>
                  {health.database === 'mongodb_connected' ? 'MongoDB Connected' : health.database === 'demo_mode' ? 'Demo Mode (no DB)' : health.database || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Gemini AI</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon ok={isOk(health.ai)} />
                <span className={`text-sm font-medium ${isOk(health.ai) ? 'text-green-600' : 'text-amber-600'}`}>
                  {health.ai === 'gemini_connected' ? 'Gemini Connected' : health.ai === 'demo_mode' ? 'Demo Mode (no key)' : health.ai || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Config info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Configuration</h2>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Backend API URL</p>
            <code className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg block">{apiUrl}</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Version</p>
            <code className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg block">{health?.version || 'Loading…'}</code>
          </div>
        </div>
      </div>

      {/* Setup guide */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🚀 Setup Guide</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Configure Gemini API Key</p>
              <p className="text-xs text-gray-500 mt-0.5">Add <code className="bg-gray-100 px-1 rounded">GEMINI_API_KEY=your_key</code> to <code className="bg-gray-100 px-1 rounded">backend/.env</code></p>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">Get your free Gemini API key →</a>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connect MongoDB (Optional)</p>
              <p className="text-xs text-gray-500 mt-0.5">Add <code className="bg-gray-100 px-1 rounded">MONGODB_URI=your_atlas_uri</code> to <code className="bg-gray-100 px-1 rounded">backend/.env</code></p>
              <p className="text-xs text-gray-500 mt-0.5">Without it, the app runs with in-memory demo data.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Restart Backend</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">cd backend && python -m uvicorn main:app --reload</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

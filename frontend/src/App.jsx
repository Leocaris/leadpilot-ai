import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import AIQualification from './pages/AIQualification'
import FollowUps from './pages/FollowUps'
import ConversationInsights from './pages/ConversationInsights'
import AgentPlayground from './pages/AgentPlayground'
import Settings from './pages/Settings'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('leadpilot_auth') === 'true'
  )

  const login = () => {
    localStorage.setItem('leadpilot_auth', 'true')
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('leadpilot_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return (
    <Layout onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/qualify" element={<AIQualification />} />
        <Route path="/followups" element={<FollowUps />} />
        <Route path="/insights" element={<ConversationInsights />} />
        <Route path="/playground" element={<AgentPlayground />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

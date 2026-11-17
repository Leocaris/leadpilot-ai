import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react'
import { chatWithAgent } from '../services/api'
import { DemoBanner, LoadingSpinner } from '../components/ui'

const SUGGESTIONS = [
  'Qualify a new lead: John Smith from TechStart, needs enterprise CRM, budget $80k, wants AI features and Salesforce integration.',
  'What makes a lead HOT vs WARM vs COLD?',
  'Generate a follow-up email for a HOT lead who showed strong interest in our AI features.',
  'How should I approach a lead who has budget but hasn\'t confirmed a timeline?',
  'Summarize best practices for B2B lead qualification.',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
        {msg.demo && <div className="text-xs opacity-60 mt-1.5">⚠️ Demo response</div>}
      </div>
    </div>
  )
}

export default function AgentPlayground() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm LeadPilot AI, your intelligent CRM assistant.\n\nI can help you:\n• **Qualify leads** — analyze requirements and generate scores\n• **Retrieve lead info** — look up and summarize CRM data\n• **Generate follow-ups** — craft personalized outreach emails\n• **Summarize conversations** — extract insights from meeting notes\n• **Sales strategy** — provide actionable recommendations\n\nWhat would you like to do today?",
      demo: false
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }))
      const r = await chatWithAgent({ message: msg, history })
      setDemoMode(r.data.demo_mode)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: r.data.response,
        demo: r.data.demo_mode
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Failed to connect to the AI backend. Make sure the FastAPI server is running on port 8000.',
        demo: false
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat reset. How can I help you today?",
      demo: false
    }])
    setDemoMode(false)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Agent Playground</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chat with your CRM AI assistant powered by Gemini</p>
        </div>
        <button onClick={reset} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" /> New Chat
        </button>
      </div>

      {demoMode && (
        <div className="mb-4">
          <DemoBanner show={true} message="AI running in demo mode — add GEMINI_API_KEY to backend .env for live responses." />
        </div>
      )}

      {/* Chat area */}
      <div className="card flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0, maxHeight: 'calc(100vh - 260px)' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">LeadPilot AI is thinking…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors text-left">
                  {s.length > 60 ? s.slice(0, 60) + '…' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your leads, follow-ups, or sales strategy… (Enter to send)"
              className="flex-1 input-field resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex-shrink-0 self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

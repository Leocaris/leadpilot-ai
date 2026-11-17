import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Leads
export const getLeads = (params = {}) => api.get('/api/leads', { params })
export const getLead = (id) => api.get(`/api/leads/${id}`)
export const createLead = (data) => api.post('/api/leads', data)
export const updateLead = (id, data) => api.put(`/api/leads/${id}`, data)
export const deleteLead = (id) => api.delete(`/api/leads/${id}`)

// AI
export const qualifyLead = (data) => api.post('/api/ai/qualify', data)
export const generateFollowup = (data) => api.post('/api/ai/followup', data)
export const summarizeConversation = (data) => api.post('/api/ai/summarize', data)
export const chatWithAgent = (data) => api.post('/api/ai/chat', data)

// Health
export const checkHealth = () => api.get('/health')

export default api

import api from './api'

export async function analyzeSymptoms(payload) {
  const response = await api.post('/predictions', payload)

  return response.data
}

export async function getPredictionHistory() {
  const response = await api.get('/predictions/history')

  return response.data
}

export async function getPrediction(predictionId) {
  const response = await api.get(`/predictions/${predictionId}`)

  return response.data
}
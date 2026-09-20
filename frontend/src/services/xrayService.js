import api from './api'

export async function analyzeXray(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/xray/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}
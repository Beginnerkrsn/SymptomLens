import api from './api'

export async function analyzeMedicalReport({
  file,
  location,
  distance,
}) {
  const formData = new FormData()

  formData.append('file', file)

  if (location?.trim()) {
    formData.append('location', location.trim())
  }

  if (distance) {
    formData.append('distance', String(distance))
  }

  const response = await api.post(
    '/medical/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function getMedicalReportHistory() {
  const response = await api.get('/medical/history')

  return response.data
}

export async function getMedicalReportHistoryDetail(
  reportId,
) {
  const response = await api.get(
    `/medical/history/${reportId}`,
  )

  return response.data
}
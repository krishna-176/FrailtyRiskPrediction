import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (data) => api.post('/api/auth/login', data)
export const register = (data) => api.post('/api/auth/register', data)
export const getMe = () => api.get('/api/auth/me')

export const createPatient = (data) => api.post('/api/patients', data)
export const getPatients = (page = 0) => api.get(`/api/patients?page=${page}`)
export const getPatient = (id) => api.get(`/api/patients/${id}`)
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data)
export const deletePatient = (id) => api.delete(`/api/patients/${id}`)
export const predict = (patientId) =>
  api.post('/api/predict', { patientId })
export const getHistory = (page = 0) => api.get(`/api/history?page=${page}`)
export const getPatientHistory = (patientId) =>
  api.get(`/api/history/${patientId}`)
export const getMyHistory = () => api.get('/api/history/me')
export const getMyPatientRecord = () => api.get('/api/patients/me')
export const getMlStatus = () => api.get('/api/ml-status')

export const createDoctor = (data) => api.post('/api/admin/doctors', data)
export const getDoctors = () => api.get('/api/admin/doctors')
export const getAllUsers = () => api.get('/api/admin/users')
export const deleteUser = (id) => api.delete(`/api/admin/users/${id}`)
export const getUserByUsername = (username) => api.get(`/api/admin/users/by-username/${username}`)

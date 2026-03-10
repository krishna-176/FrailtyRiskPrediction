import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const createPatient = (data) => axios.post(`${BASE}/api/patients`, data)
export const getPatients = (page = 0) => axios.get(`${BASE}/api/patients?page=${page}`)
export const getPatient = (id) => axios.get(`${BASE}/api/patients/${id}`)
export const updatePatient = (id, data) => axios.put(`${BASE}/api/patients/${id}`, data)
export const deletePatient = (id) => axios.delete(`${BASE}/api/patients/${id}`)
export const predict = (patientId, features) =>
  axios.post(`${BASE}/api/predict`, { patientId, ...features })
export const getHistory = (page = 0) => axios.get(`${BASE}/api/history?page=${page}`)
export const getPatientHistory = (patientId) =>
  axios.get(`${BASE}/api/history/${patientId}`)

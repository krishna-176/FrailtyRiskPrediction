import { useState, useEffect } from 'react'
import { getHistory, getPatients, getPatientHistory } from '../services/api.js'
import HistoryTable from '../components/HistoryTable/HistoryTable.jsx'

export default function History() {
  const [predictions, setPredictions] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patients, setPatients] = useState([])
  const [filterPatientId, setFilterPatientId] = useState('')

  useEffect(() => {
    getPatients(0)
      .then((res) => {
        const list = res.data.content ?? (Array.isArray(res.data) ? res.data : [])
        setPatients(list)
      })
      .catch(() => {})
  }, [])

  const fetchHistory = (p, patientId) => {
    setLoading(true)
    setError(null)
    const req = patientId ? getPatientHistory(patientId) : getHistory(p)
    req
      .then((res) => {
        const data = res.data
        const list = Array.isArray(data) ? data : (data.content ?? [])
        const tp = data.totalPages ?? 1
        setPredictions(list)
        setTotalPages(tp)
      })
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory(page, filterPatientId)
  }, [page, filterPatientId])

  const handlePatientFilter = (e) => {
    setFilterPatientId(e.target.value)
    setPage(0)
  }

  return (
    <div>
      <h1 className="page-title">Prediction History</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '16px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Filter by patient:</label>
          <select
            className="form-input"
            style={{ maxWidth: '300px' }}
            value={filterPatientId}
            onChange={handlePatientFilter}
          >
            <option value="">All Patients</option>
            {patients.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading history...</div>
      ) : (
        <HistoryTable
          predictions={predictions}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  )
}

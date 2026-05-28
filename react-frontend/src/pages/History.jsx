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
      <div className="premium-page-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="premium-page-title" style={{ justifyContent: 'flex-start', fontSize: '2.2rem', marginBottom: '4px' }}>
          <span className="premium-icon">📋</span>
          Prediction History
        </h1>
        <p className="premium-page-subtitle" style={{ margin: 0 }}>
          Review and audit past frailty predictions and generated insights.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="patients-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600 }}>Filter by Patient</label>
          <select
            className="premium-search-input"
            style={{ maxWidth: '320px', flex: '1 1 200px', cursor: 'pointer' }}
            value={filterPatientId}
            onChange={handlePatientFilter}
          >
            <option value="">All Patients — Show full history view...</option>
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
          patientsMap={Object.fromEntries(patients.map((p) => [p.id || p._id, p.name]))}
        />
      )}
    </div>
  )
}

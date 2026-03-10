import { useState, useEffect } from 'react'
import { getPatients, predict } from '../services/api.js'
import PatientForm from '../components/PatientForm/PatientForm.jsx'
import FrailtyGauge from '../components/FrailtyGauge/FrailtyGauge.jsx'
import ShapChart from '../components/ShapChart/ShapChart.jsx'
import RecommendationsPanel from '../components/RecommendationsPanel/RecommendationsPanel.jsx'
import './NewPrediction.css'

export default function NewPrediction() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingPatients, setLoadingPatients] = useState(true)

  useEffect(() => {
    getPatients(0)
      .then((res) => {
        const list = res.data.content ?? (Array.isArray(res.data) ? res.data : [])
        setPatients(list)
        if (list.length > 0) setSelectedPatientId(list[0].id || list[0]._id || '')
      })
      .catch(() => {})
      .finally(() => setLoadingPatients(false))
  }, [])

  const handleSubmit = async (features) => {
    if (!selectedPatientId) {
      setError('Please select a patient first.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predict(selectedPatientId, features)
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Prediction failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">New Frailty Prediction</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="predict-layout">
        <div className="predict-form-col">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title">Select Patient</div>
            {loadingPatients ? (
              <div className="loading">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="alert alert-info">
                No patients found. <a href="/patients">Create a patient</a> first.
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  className="form-input"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  {patients.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} (ID: {p.id || p._id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <PatientForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {result && (
          <div className="predict-results-col">
            <FrailtyGauge
              frailtyScore={result.frailtyScore ?? result.frailty_score}
              isFrail={result.isFrail ?? result.is_frail}
              probability={result.probability}
            />
            <ShapChart shapValues={result.shapValues ?? result.shap_values ?? {}} />
            <RecommendationsPanel recommendations={result.recommendations ?? []} />
          </div>
        )}
      </div>
    </div>
  )
}

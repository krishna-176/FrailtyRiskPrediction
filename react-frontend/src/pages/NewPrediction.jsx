import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPatients, predict } from '../services/api.js'
import FrailtyGauge from '../components/FrailtyGauge/FrailtyGauge.jsx'
import ShapChart from '../components/ShapChart/ShapChart.jsx'
import RecommendationsPanel from '../components/RecommendationsPanel/RecommendationsPanel.jsx'
import './NewPrediction.css'

const GENDER_LABEL = { 0: 'Female', 1: 'Male' }

export default function NewPrediction() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── React Query: patient list is cached globally ──
  const { data: patientData, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients', 0],
    queryFn: () => getPatients(0).then(r => r.data),
    onSuccess: (data) => {
      const list = data?.content ?? (Array.isArray(data) ? data : [])
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].id || list[0]._id || '')
      }
    },
  })
  const patients = patientData?.content ?? (Array.isArray(patientData) ? patientData : [])

  // Set default selection when list first loads
  if (patients.length > 0 && !selectedPatientId) {
    setSelectedPatientId(patients[0].id || patients[0]._id || '')
  }


  const handlePredict = async () => {
    if (!selectedPatientId) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predict(selectedPatientId)
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Prediction failed.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPatient = patients.find((p) => (p.id || p._id) === selectedPatientId)

  return (
    <div>
      <div className="premium-page-header">
        <h1 className="premium-page-title">
          <span className="premium-icon">✨</span>
          New Frailty Prediction
        </h1>
        <p className="premium-page-subtitle">
          Select a patient below to instantly generate a comprehensive, AI-powered frailty analysis.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className={`predict-layout ${result ? 'has-results' : ''}`}>
        <div className="predict-form-col">
          <div className="card">
            <div className="card-title">Select Patient</div>

            {loadingPatients ? (
              <div className="loading">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="alert alert-info">
                No patients found. <a href="/patients">Create a patient</a> first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Patient</label>
                  <select
                    className="form-input"
                    value={selectedPatientId}
                    onChange={(e) => { setSelectedPatientId(e.target.value); setResult(null) }}
                  >
                    {patients.map((pt) => (
                      <option key={pt.id || pt._id} value={pt.id || pt._id}>
                        {pt.name} — Age {pt.age}, {GENDER_LABEL[pt.gender] ?? pt.gender}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatient && (
                  <div className="selected-patient-info">
                    <span className="info-label">Patient ID:</span>
                    <span className="info-value mono">{selectedPatientId}</span>
                  </div>
                )}

                <button
                  className="btn btn-primary form-submit-btn"
                  onClick={handlePredict}
                  disabled={loading || !selectedPatientId}
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  {loading ? 'Predicting...' : '🔬 Predict Frailty Risk'}
                </button>
              </>
            )}
          </div>
        </div>

        {result && (
          <div className="predict-results-col">
            <FrailtyGauge
              frailtyScore={result.frailtyScore ?? result.frailty_score}
              isFrail={result.isFrail ?? result.is_frail}
              probability={result.probability}
            />
            <ShapChart shapValues={result.shapValues ?? result.shap_values ?? {}} />
            <RecommendationsPanel
              recommendations={result.recommendations ?? []}
              aiPowered={result.aiPowered ?? result.ai_powered ?? false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

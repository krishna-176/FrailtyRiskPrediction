import { useState, useEffect } from 'react'
import { getPatients, createPatient, deletePatient } from '../services/api.js'
import './Patients.css'

const EMPTY_FORM = {
  name: '', age: '', gender: '', bmi: '', hemoglobin: '', hematocrit: '',
  plateletCount: '', numComorbidities: '', systolicBp: '', creatinine: '', albumin: '',
  communityType: 'Urban', medianIncome: '', povertyRate: '', educationBachelorsPct: '',
  unemploymentRate: '', noHealthInsurancePct: '', disabilityRate: '',
  noVehiclePct: '', medianHousingCost: '',
}

const COMMUNITY_TYPES = ['Urban', 'Suburban', 'Small Town', 'Rural', 'Frontier']

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchPatients = (p = 0) => {
    setLoading(true)
    getPatients(p)
      .then((res) => {
        const list = res.data.content ?? (Array.isArray(res.data) ? res.data : [])
        const tp = res.data.totalPages ?? 1
        setPatients(list)
        setTotalPages(tp)
      })
      .catch(() => setError('Failed to load patients.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPatients(page) }, [page])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...formValues,
        age: parseFloat(formValues.age),
        gender: parseInt(formValues.gender),
        bmi: parseFloat(formValues.bmi),
        hemoglobin: parseFloat(formValues.hemoglobin),
        hematocrit: parseFloat(formValues.hematocrit),
        plateletCount: parseFloat(formValues.plateletCount),
        numComorbidities: parseInt(formValues.numComorbidities),
        systolicBp: parseFloat(formValues.systolicBp),
        creatinine: parseFloat(formValues.creatinine),
        albumin: parseFloat(formValues.albumin),
        medianIncome: parseFloat(formValues.medianIncome),
        povertyRate: parseFloat(formValues.povertyRate),
        educationBachelorsPct: parseFloat(formValues.educationBachelorsPct),
        unemploymentRate: parseFloat(formValues.unemploymentRate),
        noHealthInsurancePct: parseFloat(formValues.noHealthInsurancePct),
        disabilityRate: parseFloat(formValues.disabilityRate),
        noVehiclePct: parseFloat(formValues.noVehiclePct),
        medianHousingCost: parseFloat(formValues.medianHousingCost),
      }
      await createPatient(payload)
      setShowForm(false)
      setFormValues(EMPTY_FORM)
      fetchPatients(0)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create patient.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return
    try {
      await deletePatient(id)
      fetchPatients(page)
    } catch {
      setError('Failed to delete patient.')
    }
  }

  const filtered = patients.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="patients-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Patients</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Patient'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card patient-form-card">
          <div className="card-title">Create New Patient</div>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" name="name" value={formValues.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" name="age" value={formValues.age} onChange={handleChange} min={50} max={90} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender (0=F, 1=M)</label>
                <input className="form-input" type="number" name="gender" value={formValues.gender} onChange={handleChange} min={0} max={1} required />
              </div>
              <div className="form-group">
                <label className="form-label">BMI</label>
                <input className="form-input" type="number" name="bmi" value={formValues.bmi} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Hemoglobin (g/dL)</label>
                <input className="form-input" type="number" name="hemoglobin" value={formValues.hemoglobin} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Hematocrit (%)</label>
                <input className="form-input" type="number" name="hematocrit" value={formValues.hematocrit} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Platelet Count</label>
                <input className="form-input" type="number" name="plateletCount" value={formValues.plateletCount} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Comorbidities</label>
                <input className="form-input" type="number" name="numComorbidities" value={formValues.numComorbidities} onChange={handleChange} min={0} max={5} required />
              </div>
              <div className="form-group">
                <label className="form-label">Systolic BP</label>
                <input className="form-input" type="number" name="systolicBp" value={formValues.systolicBp} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Creatinine (mg/dL)</label>
                <input className="form-input" type="number" name="creatinine" value={formValues.creatinine} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label className="form-label">Albumin (g/dL)</label>
                <input className="form-input" type="number" name="albumin" value={formValues.albumin} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Community Type</label>
                <select className="form-input" name="communityType" value={formValues.communityType} onChange={handleChange}>
                  {COMMUNITY_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Median Income (USD)</label>
                <input className="form-input" type="number" name="medianIncome" value={formValues.medianIncome} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Poverty Rate (%)</label>
                <input className="form-input" type="number" name="povertyRate" value={formValues.povertyRate} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Education Bachelor&apos;s (%)</label>
                <input className="form-input" type="number" name="educationBachelorsPct" value={formValues.educationBachelorsPct} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Unemployment Rate (%)</label>
                <input className="form-input" type="number" name="unemploymentRate" value={formValues.unemploymentRate} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">No Insurance (%)</label>
                <input className="form-input" type="number" name="noHealthInsurancePct" value={formValues.noHealthInsurancePct} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Disability Rate (%)</label>
                <input className="form-input" type="number" name="disabilityRate" value={formValues.disabilityRate} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">No Vehicle (%)</label>
                <input className="form-input" type="number" name="noVehiclePct" value={formValues.noVehiclePct} onChange={handleChange} step="0.1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Housing Cost (USD/mo)</label>
                <input className="form-input" type="number" name="medianHousingCost" value={formValues.medianHousingCost} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create Patient'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="patients-search">
          <input
            className="form-input"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading patients...</div>
        ) : filtered.length === 0 ? (
          <div className="loading">No patients found.</div>
        ) : (
          <div className="table-scroll">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Community Type</th>
                  <th>Comorbidities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id || p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age}</td>
                    <td>{p.gender === 0 ? 'Female' : 'Male'}</td>
                    <td>{p.communityType}</td>
                    <td>{p.numComorbidities}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id || p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

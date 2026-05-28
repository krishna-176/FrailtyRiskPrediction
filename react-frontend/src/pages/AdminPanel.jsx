import { useState, useEffect } from 'react'
import { createDoctor, getDoctors, getAllUsers, deleteUser } from '../services/api'

export default function AdminPanel() {
  const [doctors, setDoctors] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [activeTab, setActiveTab] = useState('doctors')
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    getDoctors().then((r) => setDoctors(r.data)).catch(() => {})
    getAllUsers().then((r) => setAllUsers(r.data)).catch(() => {})
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
    setSuccess('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.username || form.username.length < 3) errs.username = 'Min 3 chars'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required'
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 chars'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setLoading(true)
    try {
      await createDoctor(form)
      setSuccess(`Doctor account for "${form.name}" created successfully.`)
      setForm({ name: '', username: '', email: '', password: '' })
      fetchData()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create doctor account.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove user "${name}"? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      fetchData()
    } catch {
      setServerError('Failed to delete user.')
    }
  }

  const ROLE_BADGE = { ADMIN: 'badge-admin', DOCTOR: 'badge-doctor', PATIENT: 'badge-patient' }

  return (
    <div className="page">
      <h1 className="page-title">Admin Panel</h1>

      <div className="tab-bar">
        <button className={`tab-btn${activeTab === 'doctors' ? ' tab-btn--active' : ''}`} onClick={() => setActiveTab('doctors')}>
          👨‍⚕️ Manage Doctors
        </button>
        <button className={`tab-btn${activeTab === 'users' ? ' tab-btn--active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 All Users ({allUsers.length})
        </button>
      </div>

      {activeTab === 'doctors' && (
        <div className="admin-grid">
          <section className="card">
            <h2 className="card-title">➕ Add New Doctor</h2>
            {serverError && <div className="alert alert-error">{serverError}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className={`form-input${formErrors.name ? ' error' : ''}`}
                  value={form.name} onChange={handleChange} placeholder="Dr. Jane Smith" />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input name="username" className={`form-input${formErrors.username ? ' error' : ''}`}
                  value={form.username} onChange={handleChange} placeholder="drjanesmith" />
                {formErrors.username && <span className="form-error">{formErrors.username}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" className={`form-input${formErrors.email ? ' error' : ''}`}
                  value={form.email} onChange={handleChange} placeholder="jane@hospital.com" />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input name="password" type="password" className={`form-input${formErrors.password ? ' error' : ''}`}
                  value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
                {formErrors.password && <span className="form-error">{formErrors.password}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating…' : 'Create Doctor Account'}
              </button>
            </form>
          </section>

          <section className="card">
            <h2 className="card-title">👨‍⚕️ Doctors ({doctors.length})</h2>
            {doctors.length === 0 ? (
              <p className="empty-state">No doctors added yet.</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Action</th></tr></thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td><code>{d.username}</code></td>
                      <td>{d.email}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id, d.name)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {activeTab === 'users' && (
        <section className="card">
          <h2 className="card-title">All Users ({allUsers.length})</h2>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td><code>{u.username}</code></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || ''}`}>{u.role}</span></td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

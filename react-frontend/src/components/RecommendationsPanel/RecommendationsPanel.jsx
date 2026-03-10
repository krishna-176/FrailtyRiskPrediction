import './RecommendationsPanel.css'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function formatFeatureName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function RecommendationsPanel({ recommendations }) {
  const sorted = [...recommendations].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
  )

  const grouped = { high: [], medium: [], low: [] }
  sorted.forEach((r) => {
    const key = r.priority in grouped ? r.priority : 'low'
    grouped[key].push(r)
  })

  if (recommendations.length === 0) {
    return (
      <div className="rec-panel card">
        <div className="card-title">Intervention Recommendations</div>
        <div className="rec-empty">No recommendations at this time.</div>
      </div>
    )
  }

  return (
    <div className="rec-panel card">
      <div className="card-title">Intervention Recommendations</div>

      {(['high', 'medium', 'low']).map((priority) => {
        const items = grouped[priority]
        if (items.length === 0) return null
        return (
          <div key={priority} className="rec-group">
            <div className={`rec-group-header badge badge-${priority}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </div>
            <div className="rec-cards">
              {items.map((rec, idx) => (
                <div key={idx} className={`rec-card rec-card--${priority}`}>
                  <div className="rec-card-factor">{formatFeatureName(rec.factor)}</div>
                  <div className="rec-card-text">{rec.recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

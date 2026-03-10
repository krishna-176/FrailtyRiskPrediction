import { useState } from 'react'
import './HistoryTable.css'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function HistoryTable({ predictions, totalPages, currentPage, onPageChange }) {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="history-table-wrapper card">
      <div className="card-title">Prediction History</div>

      {predictions.length === 0 ? (
        <div className="loading">No predictions found.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Patient ID</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Probability</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <>
                    <tr key={p.id || p._id} className="history-row">
                      <td>{formatDate(p.timestamp)}</td>
                      <td className="patient-id-cell">{p.patientId}</td>
                      <td>
                        <span className="score-pill" data-score={p.frailtyScore}>
                          {p.frailtyScore}/5
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.isFrail ? 'badge-frail' : 'badge-not-frail'}`}>
                          {p.isFrail ? 'Frail' : 'Not Frail'}
                        </span>
                      </td>
                      <td>{Math.round((p.probability || 0) * 100)}%</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setExpandedId(expandedId === (p.id || p._id) ? null : (p.id || p._id))}
                        >
                          {expandedId === (p.id || p._id) ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === (p.id || p._id) && (
                      <tr key={`${p.id || p._id}-exp`} className="expanded-row">
                        <td colSpan={6}>
                          <div className="expanded-content">
                            {p.topRiskFactors && p.topRiskFactors.length > 0 && (
                              <div className="expanded-section">
                                <strong>Top Risk Factors:</strong>
                                <ul className="risk-factor-list">
                                  {p.topRiskFactors.map((rf, i) => (
                                    <li key={i} className={`risk-factor-item ${rf.direction}`}>
                                      <span className="rf-name">{rf.feature}</span>
                                      <span className="rf-val">{rf.shapValue?.toFixed(4)}</span>
                                      <span className="rf-dir">
                                        {rf.direction === 'increases_risk' ? '↑' : '↓'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {p.recommendations && p.recommendations.length > 0 && (
                              <div className="expanded-section">
                                <strong>Recommendations:</strong>
                                <ul className="rec-list">
                                  {p.recommendations.map((r, i) => (
                                    <li key={i}>
                                      <span className={`badge badge-${r.priority}`}>{r.priority}</span>
                                      {' '}{r.recommendation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

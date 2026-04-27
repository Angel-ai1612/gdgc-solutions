import { useState } from 'react'
import { Image, Video, FileText, Camera } from 'lucide-react'

const mockReports = [
  { file: 'match_highlight_final.mp4', type: 'Video', status: 'Verified', score: 97, date: '2026-04-22' },
  { file: 'transfer_news_screenshot.png', type: 'Image', status: 'Suspicious', score: 42, date: '2026-04-22' },
  { file: 'goal_celebration.jpg', type: 'Image', status: 'Verified', score: 94, date: '2026-04-21' },
  { file: 'injury_report_leak.png', type: 'Screenshot', status: 'Fake', score: 12, date: '2026-04-21' },
  { file: 'press_conference_clip.mp4', type: 'Video', status: 'Verified', score: 99, date: '2026-04-20' },
  { file: 'stadium_aerial_drone.mp4', type: 'Video', status: 'Verified', score: 91, date: '2026-04-20' },
  { file: 'contract_document.pdf', type: 'Article', status: 'Suspicious', score: 38, date: '2026-04-19' },
  { file: 'penalty_replay_slow.mp4', type: 'Video', status: 'Verified', score: 88, date: '2026-04-18' },
  { file: 'team_photo_manipulated.jpg', type: 'Image', status: 'Fake', score: 8, date: '2026-04-18' },
  { file: 'halftime_interview.mp4', type: 'Video', status: 'Verified', score: 96, date: '2026-04-17' },
]

function getStatusBadge(status) {
  const cls = status === 'Verified' ? 'badge-verified' : status === 'Suspicious' ? 'badge-suspicious' : 'badge-fake'
  return <span className={`badge ${cls}`}>{status}</span>
}

function getScoreClass(score) {
  return score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low'
}

function getTypeIcon(type) {
  switch(type) {
    case 'Video': return <Video size={14} />
    case 'Image': return <Image size={14} />
    case 'Screenshot': return <Camera size={14} />
    default: return <FileText size={14} />
  }
}

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = mockReports.filter(r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false
    if (search && !r.file.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">All verification reports in one place</p>
      </div>

      <div className="filter-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Verified">Verified</option>
          <option value="Suspicious">Suspicious</option>
          <option value="Fake">Fake</option>
        </select>
        <input
          className="filter-search"
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Status</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.file}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getTypeIcon(r.type)} {r.type}
                  </span>
                </td>
                <td>{getStatusBadge(r.status)}</td>
                <td className={getScoreClass(r.score)} style={{ fontWeight: 600 }}>{r.score}%</td>
                <td>{r.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No reports match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

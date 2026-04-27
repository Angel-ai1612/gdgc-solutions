import { useNavigate } from 'react-router-dom'
import {
  FileCheck, AlertTriangle, ShieldCheck, Users,
  Upload, Play, TrendingUp, TrendingDown,
  Image, Video, FileText
} from 'lucide-react'

const recentActivity = [
  { name: 'match_highlight_final.mp4', type: 'Video', status: 'Verified', score: 97, date: 'Apr 22, 2026' },
  { name: 'transfer_news_screenshot.png', type: 'Image', status: 'Suspicious', score: 42, date: 'Apr 22, 2026' },
  { name: 'goal_celebration.jpg', type: 'Image', status: 'Verified', score: 94, date: 'Apr 21, 2026' },
  { name: 'injury_report_leak.png', type: 'Image', status: 'Fake', score: 12, date: 'Apr 21, 2026' },
  { name: 'press_conference_clip.mp4', type: 'Video', status: 'Verified', score: 99, date: 'Apr 20, 2026' },
  { name: 'stadium_aerial_drone.mp4', type: 'Video', status: 'Verified', score: 91, date: 'Apr 20, 2026' },
  { name: 'contract_document.pdf', type: 'Article', status: 'Suspicious', score: 38, date: 'Apr 19, 2026' },
]

function StatusBadge({ status }) {
  const cls = status === 'Verified' ? 'badge-verified' : status === 'Suspicious' ? 'badge-suspicious' : 'badge-fake'
  return <span className={`badge ${cls}`}>{status}</span>
}

function getScoreClass(score) {
  return score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low'
}

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your verification activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
            <FileCheck size={16} />
          </div>
          <div className="stat-card-value">1,284</div>
          <div className="stat-card-label">Total Verifications</div>
          <div className="stat-card-trend up"><TrendingUp size={11} /> +12.5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--red-muted)', color: 'var(--red-text)' }}>
            <AlertTriangle size={16} />
          </div>
          <div className="stat-card-value">47</div>
          <div className="stat-card-label">Fake Content Found</div>
          <div className="stat-card-trend down"><TrendingDown size={11} /> -3.2%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--green-muted)', color: 'var(--green-text)' }}>
            <ShieldCheck size={16} />
          </div>
          <div className="stat-card-value">94.2</div>
          <div className="stat-card-label">Trust Score</div>
          <div className="stat-card-trend up"><TrendingUp size={11} /> +1.8%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--blue-muted)', color: 'var(--blue)' }}>
            <Users size={16} />
          </div>
          <div className="stat-card-value">238</div>
          <div className="stat-card-label">Active Users</div>
          <div className="stat-card-trend up"><TrendingUp size={11} /> +8.1%</div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/verify')}>
          <Upload size={14} /> Upload File
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/verify')}>
          <Play size={14} /> Run Verification
        </button>
      </div>

      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((item, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-1)', fontWeight: 500, fontFamily: 'var(--mono)', fontSize: '12px' }}>
                  {item.name}
                </td>
                <td>{item.type}</td>
                <td><StatusBadge status={item.status} /></td>
                <td className={getScoreClass(item.score)} style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {item.score}%
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-4)' }}>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

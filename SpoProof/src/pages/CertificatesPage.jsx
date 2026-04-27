import { Award, Download, ExternalLink } from 'lucide-react'

const mockCertificates = [
  { id: 'CERT-2026-001', asset: 'match_highlight_final.mp4', owner: 'ESPN Digital', date: '2026-04-22' },
  { id: 'CERT-2026-002', asset: 'goal_celebration.jpg', owner: 'Sports Weekly', date: '2026-04-21' },
  { id: 'CERT-2026-003', asset: 'press_conference_clip.mp4', owner: 'Premier League', date: '2026-04-20' },
  { id: 'CERT-2026-004', asset: 'stadium_aerial_drone.mp4', owner: 'Sky Sports', date: '2026-04-20' },
  { id: 'CERT-2026-005', asset: 'penalty_replay_slow.mp4', owner: 'Real Madrid CF', date: '2026-04-18' },
  { id: 'CERT-2026-006', asset: 'halftime_interview.mp4', owner: 'BBC Sport', date: '2026-04-17' },
  { id: 'CERT-2026-007', asset: 'training_session_reel.mp4', owner: 'Manchester City', date: '2026-04-16' },
  { id: 'CERT-2026-008', asset: 'pre_match_analysis.jpg', owner: 'The Athletic', date: '2026-04-15' },
]

export default function CertificatesPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Certificates</h1>
        <p className="page-subtitle">Ownership and authenticity certificates for verified assets</p>
      </div>

      {mockCertificates.map((cert) => (
        <div key={cert.id} className="cert-card">
          <div className="cert-card-icon">
            <Award size={22} />
          </div>
          <div className="cert-card-info">
            <h4>{cert.asset}</h4>
            <div className="cert-card-meta">
              <span>ID: {cert.id}</span>
              <span>Owner: {cert.owner}</span>
              <span>{cert.date}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm">
              <ExternalLink size={14} /> View
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

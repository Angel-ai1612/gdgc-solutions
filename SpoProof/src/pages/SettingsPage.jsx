import { useState } from 'react'

const API = import.meta.env.VITE_API_URL
const tabs = ['Profile', 'Notifications', 'Appearance', 'Security', 'Billing']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.target)
    const payload = {
      name: formData.get('name'),
      organization: formData.get('organization'),
      role: formData.get('role'),
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')

      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`settings-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="settings-section">
        {activeTab === 'Profile' && (
          <form onSubmit={handleSaveProfile}>
            <h3>Profile Information</h3>
            {message && (
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: 8, 
                marginBottom: 20,
                fontSize: '0.9rem',
                backgroundColor: message.type === 'success' ? '#f6ffed' : '#fff1f0',
                border: `1px solid ${message.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
                color: message.type === 'success' ? '#389e0d' : '#cf1322'
              }}>
                {message.text}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" defaultValue={user?.name} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" defaultValue={user?.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} title="Email cannot be changed" />
            </div>
            <div className="form-group">
              <label className="form-label">Organization</label>
              <input className="form-input" name="organization" defaultValue={user?.organization || ''} placeholder="e.g. SpoProof Inc." />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" name="role" defaultValue={user?.role || ''} placeholder="e.g. Content Moderator" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'Notifications' && (
          <>
            <h3>Notification Preferences</h3>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Email Notifications</h4>
                <p>Receive verification results via email</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Alert Notifications</h4>
                <p>Get notified about high-risk content</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Weekly Reports</h4>
                <p>Receive a weekly summary of your activity</p>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Marketing Emails</h4>
                <p>Product updates and feature announcements</p>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
          </>
        )}

        {activeTab === 'Appearance' && (
          <>
            <h3>Appearance</h3>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Dark Mode</h4>
                <p>Use dark theme across the application</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Compact View</h4>
                <p>Reduce spacing in tables and lists</p>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Animations</h4>
                <p>Enable motion and transition effects</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
          </>
        )}

        {activeTab === 'Security' && (
          <>
            <h3>Security</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" style={{ marginBottom: 32 }}>Update Password</button>

            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <h4>Login Alerts</h4>
                <p>Get notified of new device sign-ins</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
          </>
        )}

        {activeTab === 'Billing' && (
          <>
            <h3>Billing & Plan</h3>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Pro Plan</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Unlimited verifications • Priority support • API access</p>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>$49<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary">Change Plan</button>
              <button className="btn btn-ghost">View Invoices</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

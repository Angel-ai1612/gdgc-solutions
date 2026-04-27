import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userStr = params.get('user')
    
    if (token) {
      localStorage.setItem('token', token)
      if (userStr) {
        try {
          localStorage.setItem('user', decodeURIComponent(userStr))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
      navigate('/app/dashboard')
    } else {
      navigate('/auth?error=callback_failed')
    }
  }, [navigate])
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-1)',
      color: 'var(--text-1)'
    }}>
      <div className="analysis-spinner" style={{ marginBottom: 20 }} />
      <h2>Signing you in...</h2>
      <p style={{ color: 'var(--text-3)', marginTop: 10 }}>Please wait while we finalize your authentication.</p>
    </div>
  )
}

import { Request, Response } from 'express'
import axios from 'axios'
import { supabase } from '../config/supabase'
import { signJWT } from '../utils/jwt'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!
const DEFAULT_CREDITS = parseInt(process.env.DEFAULT_CREDITS || '10')
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── Google OAuth ──────────────────────────────────────────────────────────────

export function googleRedirect(_req: Request, res: Response) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CALLBACK_URL) {
    return res.status(503).json({ error: 'oauth_not_configured', message: 'Google OAuth is not configured.' })
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

export async function googleCallback(req: Request, res: Response) {
  const { code } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/auth?error=missing_code`)
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    return res.redirect(`${FRONTEND_URL}/auth?error=oauth_not_configured`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code: code as string,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const { access_token } = tokenRes.data

    // Get user profile
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const { id: googleId, email, name, picture } = profileRes.data

    // Upsert into Supabase auth.users via admin API, then our public.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { name, avatar_url: picture, provider: 'google', google_id: googleId },
    })

    let userId: string
    if (authError) {
      console.log('Supabase Admin CreateUser Info/Error:', authError.message)

      // Handle existing users (broaden the check)
      const msg = authError.message.toLowerCase()
      if (msg.includes('registered') || msg.includes('exists') || msg.includes('already')) {
        const { data: existing, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
          console.error('Supabase Admin ListUsers Error:', listError.message)
          return res.redirect(`${FRONTEND_URL}/auth?error=user_lookup_failed`)
        }
        const found = existing?.users?.find(u => u.email === email)
        if (!found) {
          console.error('User not found in list after "already registered" error')
          return res.redirect(`${FRONTEND_URL}/auth?error=user_lookup_failed`)
        }
        userId = found.id
      } else {
        console.error('Supabase Admin CreateUser Fatal Error:', authError.message)
        return res.redirect(`${FRONTEND_URL}/auth?error=auth_failed&detail=${encodeURIComponent(authError.message)}`)
      }
    } else if (authUser?.user) {
      userId = authUser.user.id
    } else {
      console.error('Google OAuth: No authUser returned and no clear error')
      return res.redirect(`${FRONTEND_URL}/auth?error=auth_failed`)
    }

    // Upsert public.users
    const { error: upsertError } = await supabase.from('users').upsert({
      id: userId, email, name: name ?? email.split('@')[0],
      avatar_url: picture, provider: 'google', credits: DEFAULT_CREDITS,
    }, { onConflict: 'id', ignoreDuplicates: false })

    if (upsertError) {
      console.error('Public Users Upsert Error:', upsertError.message)
      return res.redirect(`${FRONTEND_URL}/auth?error=db_upsert_failed`)
    }

    // Upsert user_settings
    await supabase.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })

    const token = signJWT({ userId, email })
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  } catch (err: any) {
    if (err.response?.data) {
      console.error('GOOGLE ERROR DETAIL:', JSON.stringify(err.response.data))
    }
    console.error('Google OAuth Critical Error:', err.message, err.stack)
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`)
  }
}

// ── Email / Password ──────────────────────────────────────────────────────────

export async function emailRegister(req: Request, res: Response) {
  const { email, password, name } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'missing_fields', message: 'email, password, and name are required' })
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ error: 'invalid_fields', message: 'email, password, and name must be strings' })
  }
  if (password.length < 8) return res.status(400).json({ error: 'weak_password', message: 'Password must be at least 8 characters.' })

  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })
  if (error) return res.status(400).json({ error: 'registration_failed', message: error.message })

  const userId = data.user!.id
  const { error: userError } = await supabase.from('users').insert({ id: userId, email, name, provider: 'email', credits: DEFAULT_CREDITS })
  if (userError) return res.status(500).json({ error: 'user_create_failed', message: userError.message })
  await supabase.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id' })

  const token = signJWT({ userId, email })
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  return res.status(201).json({ success: true, token, user })
}

export async function emailLogin(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'missing_fields', message: 'email and password required' })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return res.status(401).json({ error: 'invalid_credentials', message: 'Incorrect email or password' })

  const { data: user } = await supabase.from('users').select('*').eq('id', data.user.id).single()
  if (!user) return res.status(404).json({ error: 'user_not_found' })

  const token = signJWT({ userId: user.id, email: user.email })
  return res.json({ success: true, token, user })
}

// ── Me ────────────────────────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response) {
  return res.json({ success: true, user: req.user })
}

export async function updateProfile(req: Request, res: Response) {
  const { name, organization, role } = req.body
  const updates: Record<string, string> = {}
  if (typeof name === 'string') updates.name = name.trim()
  if (typeof organization === 'string') updates.organization = organization.trim()
  if (typeof role === 'string') updates.role = role.trim()
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'no_valid_fields', message: 'No valid profile fields provided.' })
  }

  const { data, error } = await supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', req.user!.id).select().single()
  if (error) return res.status(500).json({ error: 'update_failed', message: error.message })
  return res.json({ success: true, user: data })
}

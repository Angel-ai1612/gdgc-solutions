import crypto from 'crypto'
import { JWTPayload } from '../types'

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const DEV_SECRET = 'spoproof-dev-secret-change-before-production'
let warnedAboutDevSecret = false

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production')
    }
    if (!warnedAboutDevSecret) {
      console.warn('JWT_SECRET is not set. Using a development-only signing secret.')
      warnedAboutDevSecret = true
    }
    return DEV_SECRET
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return secret
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function decodeBase64url(part: string): Buffer {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64')
}

function parseExpiry(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 3600
  const val = parseInt(match[1])
  const unit = match[2]
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return val * multiplier[unit]
}

export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + parseExpiry(EXPIRES_IN),
  }))
  const sig = base64url(
    crypto.createHmac('sha256', getSecret()).update(`${header}.${fullPayload}`).digest()
  )
  return `${header}.${fullPayload}.${sig}`
}

export function verifyJWT(token: string): JWTPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token format')
  const [header, payload, sig] = parts
  const decodedHeader = JSON.parse(decodeBase64url(header).toString('utf8'))
  if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
    throw new Error('Unsupported token header')
  }
  const expectedSig = base64url(
    crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest()
  )
  const provided = Buffer.from(sig)
  const expected = Buffer.from(expectedSig)
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Invalid token signature')
  }
  const decoded = JSON.parse(decodeBase64url(payload).toString('utf8')) as JWTPayload
  if (!decoded.userId || !decoded.email) throw new Error('Invalid token payload')
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
  return decoded
}

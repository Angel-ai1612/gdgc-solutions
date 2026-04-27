import { SourceSignal, HashSignal, MetadataSignal, DeepfakeSignal, ReverseImageSignal, FactCheckSignal, VerificationResult, VerificationStatus, MediaType } from '../types'
import { v4 as uuidv4 } from 'uuid'

const NEUTRAL_BASE = 15

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

function deriveStatus(score: number): VerificationStatus {
  if (score >= 70) return 'Verified'
  if (score >= 40) return 'Suspicious'
  return 'Fake'
}

function deriveMetadataStatus(meta: MetadataSignal): 'Clean' | 'Partial' | 'Altered' {
  if (meta.verdict === 'present') return 'Clean'
  if (meta.verdict === 'absent') return 'Partial'
  return 'Altered'
}

function buildRecommendation(status: VerificationStatus, signals: VerificationResult['signals']): string {
  if (status === 'Verified') return 'Content appears authentic across all verification signals. Safe to share with confidence.'
  if (status === 'Fake') {
    const reasons: string[] = []
    if (signals.deepfake?.verdict === 'likely_manipulated') reasons.push('strong AI/deepfake signals detected')
    if (signals.reverseImage?.verdict === 'manipulated_copy_found') reasons.push('known manipulated copy found online')
    if (signals.hash.verdict === 'match_manipulated') reasons.push('matches known manipulated reference')
    if (signals.source.verdict === 'unknown') reasons.push('unverified source')
    return `High risk — ${reasons.join('; ')}. Do not share without thorough independent verification.`
  }
  if (signals.deepfake?.verdict === 'possibly_manipulated') return 'Possible manipulation signals detected. Verify with additional sources before sharing.'
  if (signals.source.verdict === 'verified') return 'Source is trusted but content could not be fully verified. Treat with moderate caution.'
  return 'Source and content could not be fully verified. Independently confirm before sharing.'
}

export function computeVerificationResult(
  userId: string,
  mediaType: MediaType,
  source: SourceSignal,
  hash: HashSignal,
  metadata: MetadataSignal,
  deepfake?: DeepfakeSignal,
  reverseImage?: ReverseImageSignal,
  factCheck?: FactCheckSignal,
  fileName?: string,
  fileSize?: number,
  submittedUrl?: string,
): VerificationResult {
  const raw = NEUTRAL_BASE + source.score + hash.score + metadata.score + (deepfake?.score ?? 0) + (reverseImage?.score ?? 0) + (factCheck?.score ?? 0)
  const trustScore = clamp(raw, 0, 100)
  const status = deriveStatus(trustScore)

  // Map to the exact metrics the ResultPage.jsx expects
  const authenticity = trustScore
  const sourceMatch = source.verdict === 'verified' ? clamp(70 + source.score, 0, 100) : clamp(20 + hash.score, 0, 100)
  const tamperRisk = deepfake
    ? clamp(deepfake.details.fakeScore ? deepfake.details.fakeScore * 100 : (100 - trustScore), 0, 100)
    : clamp(100 - trustScore, 0, 100)
  const aiProbability = deepfake?.details.fakeScore
    ? Math.round(deepfake.details.fakeScore * 100)
    : status === 'Fake' ? clamp(100 - trustScore + 20, 0, 100) : clamp(100 - trustScore, 5, 100)
  const metadataStatus = deriveMetadataStatus(metadata)

  const signals: VerificationResult['signals'] = { source, hash, metadata, deepfake, reverseImage, factCheck }
  const recommendation = buildRecommendation(status, signals)

  return {
    id: uuidv4(),
    userId,
    status,
    trustScore,
    mediaType,
    fileName,
    fileSize,
    submittedUrl,
    metrics: { authenticity, sourceMatch, tamperRisk, aiProbability, metadataStatus },
    signals,
    recommendation,
    createdAt: new Date().toISOString(),
  }
}

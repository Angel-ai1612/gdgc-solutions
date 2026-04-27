import { GoogleGenerativeAI } from '@google/generative-ai'
import { VerificationResult, ChatMessage } from '../types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function buildSystemContext(result: VerificationResult): string {
  return `You are SpoProof's AI assistant. You help users understand the authenticity verification result of a sports media file.

VERIFICATION RESULT:
- File: ${result.fileName ?? result.submittedUrl ?? 'Unknown'}
- Status: ${result.status}
- Trust Score: ${result.trustScore}/100
- Media Type: ${result.mediaType}
- Analyzed at: ${result.createdAt}

METRICS:
- Authenticity: ${result.metrics.authenticity}%
- Source Match: ${result.metrics.sourceMatch}%
- Tamper Risk: ${result.metrics.tamperRisk}%
- AI Probability: ${result.metrics.aiProbability}%
- Metadata: ${result.metrics.metadataStatus}

SIGNAL BREAKDOWN:
- Source Credibility: ${result.signals.source.verdict} (${result.signals.source.reason})
- Content Hash: ${result.signals.hash.verdict} (${result.signals.hash.reason})
- Metadata: ${result.signals.metadata.verdict} (${result.signals.metadata.reason})
${result.signals.deepfake ? `- Deepfake Analysis: ${result.signals.deepfake.verdict} (${result.signals.deepfake.reason})` : ''}
${result.signals.reverseImage ? `- Reverse Image: ${result.signals.reverseImage.verdict} (${result.signals.reverseImage.reason})` : ''}
${result.signals.factCheck ? `- Sports Fact Check: ${result.signals.factCheck.verdict} (${result.signals.factCheck.reason})` : ''}

RECOMMENDATION: ${result.recommendation}

Answer questions about this result clearly and concisely. If asked about things unrelated to this verification, politely redirect the conversation back to the analysis. Do not make up information beyond what's in the verification data.`
}

export async function chatWithGemini(
  result: VerificationResult,
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: buildSystemContext(result),
  })

  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
  })

  const response = await chat.sendMessage(userMessage)
  return response.response.text()
}

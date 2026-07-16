import { config } from '../config.js';

// Tencent Hunyuan HY-Image 3.0 via TokenHub API
// 腾讯混元图像生成 — 国内首选
// API: tokenhub.tencentmaas.com

const TOKENHUB_BASE = 'https://tokenhub.tencentmaas.com/v1/api/image';
const MODEL = config.HUNYUAN_MODEL || 'hy-image-v3.0';
const POLL_MAX = 20;        // max poll attempts
const POLL_INTERVAL = 3000; // ms between polls

interface SubmitResponse {
  id: string;
  status: string;
  object: string;
}

interface QueryResponse {
  status: string;
  data?: Array<{ url: string }>;
  error?: { message: string };
}

/**
 * Generate an image using Hunyuan HY-Image 3.0 (TokenHub).
 */
export async function generateWithHunyuan(params: {
  prompt: string;
  imageUrl?: string; // for future img2img support
}): Promise<string> {
  const apiKey = config.TENCENT_SECRET_KEY; // Using sk- key for TokenHub auth
  if (!apiKey) {
    throw new Error('Hunyuan API key not configured (set TENCENT_SECRET_KEY)');
  }

  // Step 1: Submit
  const submitBody: Record<string, unknown> = {
    model: MODEL,
    prompt: params.prompt,
  };

  const submitRes = await fetch(`${TOKENHUB_BASE}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submitBody),
  });

  if (!submitRes.ok) {
    const err = await submitRes.json().catch(() => ({}));
    throw new Error(`Hunyuan submit failed [${submitRes.status}]: ${JSON.stringify(err)}`);
  }

  const { id: jobId } = await submitRes.json() as SubmitResponse;
  if (!jobId) throw new Error('Hunyuan submit returned no job ID');

  // Step 2: Poll for result
  for (let i = 0; i < POLL_MAX; i++) {
    await sleep(POLL_INTERVAL);

    const queryRes = await fetch(`${TOKENHUB_BASE}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, id: jobId }),
    });

    if (!queryRes.ok) continue;

    const result = await queryRes.json() as QueryResponse;

    if (result.status === 'completed' && result.data?.[0]?.url) {
      return result.data[0].url;
    }

    if (result.status === 'failed') {
      throw new Error(`Hunyuan generation failed: ${result.error?.message || 'unknown'}`);
    }
  }

  throw new Error('Hunyuan generation timed out');
}

/**
 * Check if Hunyuan is available as the primary provider.
 */
export function isHunyuanAvailable(): boolean {
  return !!config.TENCENT_SECRET_KEY;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

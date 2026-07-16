import { config } from '../config.js';

// Tencent Hunyuan Image Generation — 国内首选
// Uses Tencent Cloud API v3 (TC3-HMAC-SHA256) via REST
// API docs: https://cloud.tencent.com/document/product/1729/105969

interface HunyuanResponse {
  Response?: {
    ResultImage?: string;
    JobStatusCode?: string;
    Error?: { Code: string; Message: string };
  };
}

/**
 * Generate an image using Tencent Hunyuan (img2img).
 * Requires TENCENT_SECRET_ID and TENCENT_SECRET_KEY in config.
 */
export async function generateWithHunyuan(params: {
  prompt: string;
  imageUrl: string;
}): Promise<string> {
  const secretId = config.TENCENT_SECRET_ID;
  const secretKey = config.TENCENT_SECRET_KEY;

  if (!secretId || !secretKey) {
    throw new Error('Hunyuan credentials not configured');
  }

  // Download input image
  const imageRes = await fetch(params.imageUrl);
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');

  // Call Hunyuan API via TC3 signature
  const host = 'hunyuan.tencentcloudapi.com';
  const service = 'hunyuan';
  const action = 'SubmitHunyuanImageJob';
  const version = '2023-09-01';
  const region = 'ap-guangzhou';

  const payload = JSON.stringify({
    Prompt: params.prompt,
    InputImage: imageBase64,
    Resolution: '1024:1024',
    Num: 1,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

  const headers = await signTC3(
    secretId,
    secretKey,
    host,
    service,
    action,
    version,
    region,
    payload,
    timestamp,
    date,
  );

  const response = await fetch(`https://${host}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: payload,
  });

  const result = await response.json() as HunyuanResponse;

  if (result.Response?.Error) {
    throw new Error(`Hunyuan [${result.Response.Error.Code}]: ${result.Response.Error.Message}`);
  }

  const resultBase64 = result.Response?.ResultImage;
  if (!resultBase64) {
    throw new Error('Hunyuan returned no image');
  }

  return `data:image/png;base64,${resultBase64}`;
}

export function isHunyuanAvailable(): boolean {
  return !!(config.TENCENT_SECRET_ID && config.TENCENT_SECRET_KEY);
}

// ── TC3-HMAC-SHA256 Signature ──

async function signTC3(
  secretId: string,
  secretKey: string,
  host: string,
  service: string,
  action: string,
  version: string,
  region: string,
  payload: string,
  timestamp: number,
  date: string,
): Promise<Record<string, string>> {
  const algorithm = 'TC3-HMAC-SHA256';

  // Step 1: Canonical Request
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const hashedPayload = sha256(payload);
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;

  // Step 2: String to Sign
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // Step 3: Signature
  const kDate = hmac(`TC3${secretKey}`, date);
  const kService = hmac(kDate, service);
  const kSigning = hmac(kService, 'tc3_request');
  const signature = hmacHex(kSigning, stringToSign);

  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Host': host,
    'X-TC-Action': action,
    'X-TC-Version': version,
    'X-TC-Timestamp': String(timestamp),
    'X-TC-Region': region,
    'Authorization': authorization,
  };
}

import { createHash, createHmac } from 'crypto';

function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf-8').digest('hex');
}

function hmac(key: string | Buffer, data: string): Buffer {
  const keyBuf = typeof key === 'string' ? Buffer.from(key, 'utf-8') : key;
  return createHmac('sha256', keyBuf).update(data, 'utf-8').digest();
}

function hmacHex(key: Buffer, data: string): string {
  return createHmac('sha256', key).update(data, 'utf-8').digest('hex');
}

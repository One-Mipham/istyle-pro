import { Worker } from 'bullmq';
import { config } from '../config.js';
import { replicate } from '../lib/replicate.js';
import { generateWithHunyuan, isHunyuanAvailable } from '../lib/hunyuan.js';
import { supabaseAdmin } from '../lib/supabase.js';

interface GenerateJob {
  taskId: string;
  userId: string;
  originalImageUrl: string;
  styleTemplateIds: string[];
  prompt: string;
}

const MODEL = config.REPLICATE_MODEL;

const worker = new Worker<GenerateJob>('image-generation', async (job) => {
  const { taskId, originalImageUrl, prompt } = job.data;

  console.log(`[worker] Processing task ${taskId}: ${prompt.substring(0, 80)}...`);

  await supabaseAdmin
    .from('generation_history')
    .update({ status: 'processing' })
    .eq('id', taskId);

  let resultUrl: string;
  const provider = resolveProvider();

  try {
    if (provider === 'hunyuan') {
      resultUrl = await generateWithHunyuan({ prompt, imageUrl: originalImageUrl });
      console.log(`[worker] Task ${taskId} completed via 腾讯混元`);
    } else {
      const output = await replicate.run(MODEL as `${string}/${string}`, {
        input: {
          image: originalImageUrl,
          prompt,
          num_inference_steps: 28,
          guidance: 3.5,
        },
      });
      resultUrl = String(Array.isArray(output) ? output[0] : output);
      console.log(`[worker] Task ${taskId} completed via Replicate`);
    }
  } catch (primaryErr) {
    // Fallback: if Hunyuan fails and Replicate is available, retry with Replicate
    if (provider === 'hunyuan') {
      console.warn(`[worker] Hunyuan failed, falling back to Replicate: ${(primaryErr as Error).message}`);
      try {
        const output = await replicate.run(MODEL as `${string}/${string}`, {
          input: {
            image: originalImageUrl,
            prompt,
            num_inference_steps: 28,
            guidance: 3.5,
          },
        });
        resultUrl = String(Array.isArray(output) ? output[0] : output);
        console.log(`[worker] Task ${taskId} completed via Replicate (fallback)`);
      } catch (fallbackErr) {
        console.error(`[worker] Both providers failed for task ${taskId}`);
        throw fallbackErr;
      }
    } else {
      throw primaryErr;
    }
  }

  await supabaseAdmin
    .from('generation_history')
    .update({ result_image_url: resultUrl, status: 'completed' })
    .eq('id', taskId);

}, {
  connection: { url: config.REDIS_URL },
  concurrency: 1,
});

/**
 * Resolve AI provider based on config.
 * auto → hunyuan if configured, else replicate
 */
function resolveProvider(): 'hunyuan' | 'replicate' {
  if (config.AI_PROVIDER === 'hunyuan') return 'hunyuan';
  if (config.AI_PROVIDER === 'replicate') return 'replicate';
  // auto: prefer Hunyuan for China-based deployment
  return isHunyuanAvailable() ? 'hunyuan' : 'replicate';
}

worker.on('failed', async (job, err) => {
  console.error(`[worker] Task ${job?.data?.taskId} failed:`, err.message);
  if (job?.data) {
    const { taskId } = job.data as GenerateJob;
    await supabaseAdmin
      .from('generation_history')
      .update({ status: 'failed' })
      .eq('id', taskId);
  }
});

worker.on('completed', (job) => {
  console.log(`[worker] Task ${job.data.taskId} completed successfully`);
});

const activeProvider = resolveProvider();
console.log(`[worker] Generation worker started, watching queue "image-generation"`);
console.log(`[worker] Primary provider: ${activeProvider === 'hunyuan' ? '腾讯混元' : 'Replicate'}`);
if (activeProvider === 'hunyuan') {
  console.log(`[worker] Fallback provider: Replicate (${MODEL})`);
}

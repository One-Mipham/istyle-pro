import { Worker } from 'bullmq';
import { config } from '../config.js';
import { replicate } from '../lib/replicate.js';
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

  const output = await replicate.run(MODEL as `${string}/${string}`, {
    input: {
      image: originalImageUrl,
      prompt,
      num_inference_steps: 28,
      guidance: 3.5,
    },
  });

  const resultUrl = String(Array.isArray(output) ? output[0] : output);
  console.log(`[worker] Task ${taskId} completed: ${resultUrl}`);

  await supabaseAdmin
    .from('generation_history')
    .update({ result_image_url: resultUrl, status: 'completed' })
    .eq('id', taskId);

}, {
  connection: { url: config.REDIS_URL },
  concurrency: 1,
});

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

console.log(`[worker] Generation worker started, watching queue "image-generation"`);
console.log(`[worker] Using model: ${MODEL}`);

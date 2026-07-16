import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'sb-test-key',
      REPLICATE_API_TOKEN: 'r8_test_token',
    },
  },
});

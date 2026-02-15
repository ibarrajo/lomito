import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/**/*.test.ts',
      'packages/**/*.test.ts',
      'supabase/functions/**/*.test.ts',
    ],
    exclude: ['node_modules', '.worktrees'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, '__mocks__/react-native.ts'),
      '@lomito/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@lomito/ui': path.resolve(__dirname, 'packages/ui/src'),
    },
  },
});

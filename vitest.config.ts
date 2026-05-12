import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.next/**',
      // Stale Claude worktrees mirror packages/* with separate node_modules;
      // including them double-runs the test suite under a divergent React
      // instance and produces phantom "useState is null" failures.
      '**/.claude/worktrees/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/e2e/**',
        '**/*.config.*',
      ],
    },
    alias: [
      // packages/ui exposes its source via `./src/*` in package.json `exports`.
      // Vitest's substring alias can't follow that exports map, so add an
      // explicit rule that includes the `src/` segment for UI subpaths.
      {
        find: /^@workspace\/ui\/(.+)$/,
        replacement: path.resolve(__dirname, './packages/ui/src/$1'),
      },
      // Catchall for the remaining workspace packages — relied on by existing
      // services tests; leave behavior unchanged.
      {
        find: '@workspace',
        replacement: path.resolve(__dirname, './packages'),
      },
    ],
  },
});

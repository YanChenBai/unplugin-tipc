import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/__test__/**/*.test.ts'],
    environment: 'node',
    coverage: {
      include: [
        'core/**/*.ts',
      ],
      exclude: [
      ],
    },
  },
})

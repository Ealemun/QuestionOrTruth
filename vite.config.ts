import { defineConfig } from 'vitest/config'
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  root: './src/client',
  plugins: [ ],
  server: {
    watch: {
      usePolling: true
    }
  },
  resolve: {
    alias: {
        '@client': path.resolve(__dirname, './src/client/src'),
        '@server': path.resolve(__dirname, './src/server/src'),
        '@shared': path.resolve(__dirname, './src/shared/src')
    }
}
})

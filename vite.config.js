import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'soundbackgrounds',
      formats: ['es', 'umd'],
      fileName: (format) => `soundbackgrounds.${format}.js`
    },
    rollupOptions: {
      external: ['p5'],
      output: {
        globals: {
          p5: 'p5'
        }
      }
    }
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self'; connect-src 'self';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'microphone=self',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    },
    https: true // Forzar HTTPS en desarrollo
  }
});
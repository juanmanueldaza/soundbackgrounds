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
  }
});
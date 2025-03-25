import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        testTimeout: 10000,
        setupFiles: ['./test/setup.js'],
        deps: {
            inline: ['p5']
        }
    }
});

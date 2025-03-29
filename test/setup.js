import { beforeAll, vi } from 'vitest';

beforeAll(() => {
    process.env.NODE_ENV = 'test';
    // Silence p5.sound warnings
    console.warn = vi.fn();
});

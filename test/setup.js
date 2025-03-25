import { beforeAll, vi } from 'vitest';

beforeAll(() => {
    process.env.NODE_ENV = 'test';
    // Silenciar advertencias de p5.sound
    console.warn = vi.fn();
});

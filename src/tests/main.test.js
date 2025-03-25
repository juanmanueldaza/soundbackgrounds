import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import soundbackgrounds from '../main.js';

describe('Soundbackgrounds Package', () => {
    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        vi.useFakeTimers();
        
        // Reset del estado
        soundbackgrounds.p5Instance = null;
        soundbackgrounds.drawingContext = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize successfully', async () => {
        await soundbackgrounds.initialize();
        expect(soundbackgrounds).toBeDefined();
    });

    it('should register a cartridge and setup drawing context', async () => {
        const mockCartridge = {
            setupCartridge: vi.fn(),
            drawCartridge: vi.fn()
        };

        const result = await soundbackgrounds.registerCartridge(mockCartridge);
        expect(mockCartridge.setupCartridge).toHaveBeenCalled();
        expect(result.drawingContext).toBeDefined();
    });

    describe('DrawingContext', () => {
        it('should provide drawing methods', async () => {
            let setupExecuted = false;
            const mockCartridge = {
                setupCartridge: (ctx) => {
                    setupExecuted = true;
                    expect(ctx.noStroke).toBeDefined();
                    expect(ctx.fill).toBeDefined();
                    expect(ctx.rect).toBeDefined();
                    expect(ctx.map).toBeDefined();
                },
                drawCartridge: vi.fn()
            };

            await soundbackgrounds.registerCartridge(mockCartridge);
            expect(setupExecuted).toBe(true);
        });

        it('should properly map values', async () => {
            let mappedValue;
            const mockCartridge = {
                setupCartridge: (ctx) => {
                    mappedValue = ctx.map(50, 0, 100, 0, 200);
                },
                drawCartridge: vi.fn()
            };

            await soundbackgrounds.registerCartridge(mockCartridge);
            vi.runAllTimers();
            expect(mappedValue).toBe(100);
        });
    });

    describe('Audio Analysis', () => {
        it('should provide spectrum data to cartridge', async () => {
            let spectrumData;
            const mockCartridge = {
                setupCartridge: vi.fn(),
                drawCartridge: (ctx, spectrum) => {
                    spectrumData = spectrum;
                }
            };

            await soundbackgrounds.registerCartridge(mockCartridge);
            expect(spectrumData).toBeDefined();
            expect(Array.isArray(spectrumData)).toBe(true);
            expect(spectrumData.length).toBe(10);
        });
    });
});
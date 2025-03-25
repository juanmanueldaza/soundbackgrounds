declare module 'soundbackgrounds' {
    interface DrawingContext {
        noStroke(): void;
        fill(r: number, g: number, b: number): void;
        rect(x: number, y: number, w: number, h: number): void;
        map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;
    }

    interface Cartridge {
        setupCartridge(ctx: DrawingContext): void;
        drawCartridge(ctx: DrawingContext, spectrum: number[], width: number, height: number): void;
    }

    interface Soundbackgrounds {
        initialize(): Promise<Soundbackgrounds>;
        registerCartridge(cartridge: Cartridge): Promise<Soundbackgrounds>;
    }

    const soundbackgrounds: Soundbackgrounds;
    export default soundbackgrounds;
}

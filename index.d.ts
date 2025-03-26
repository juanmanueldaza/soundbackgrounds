declare module "soundbackgrounds" {
  interface DrawingContext {
    noStroke(): void;
    stroke(r: number, g: number, b: number, a?: number): void;
    strokeWeight(weight: number): void;
    fill(r: number, g: number, b: number, a?: number): void;
    noFill(): void;
    rect(x: number, y: number, w: number, h: number): void;
    ellipse(x: number, y: number, w: number, h: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    triangle(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
    ): void;
    map(
      value: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number,
    ): number;
    color(r: number, g: number, b: number, a?: number): any;
    lerpColor(c1: any, c2: any, amt: number): any;
  }

  interface CartridgeState {
    [key: string]: any;
  }

  interface Cartridge {
    setupCartridge(ctx: DrawingContext): CartridgeState | void;
    drawCartridge(
      ctx: DrawingContext,
      spectrum: number[],
      width: number,
      height: number,
      state: CartridgeState,
    ): CartridgeState | void;
  }

  interface SoundBackgroundsConfig {
    canvasParent?: string | HTMLElement;
    frameRate?: number;
    backgroundColor?: number | [number, number, number];
    audioSmoothing?: number;
    audioBinCount?: number;
  }

  interface Soundbackgrounds {
    initialize(config?: SoundBackgroundsConfig): Promise<Soundbackgrounds>;
    registerCartridge(
      cartridge: Cartridge,
    ): Promise<{ soundbackgrounds: Soundbackgrounds; id: string }>;
    removeCartridge(id: string): boolean;
    destroy(): Promise<Soundbackgrounds>;
  }

  const soundbackgrounds: Soundbackgrounds;
  export default soundbackgrounds;
}

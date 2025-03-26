export interface DrawingContext {
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

export interface CartridgeState {
  [key: string]: any;
}

export interface Cartridge {
  setupCartridge(ctx: DrawingContext): CartridgeState | void;
  drawCartridge(
    ctx: DrawingContext,
    spectrum: number[],
    width: number,
    height: number,
    state: CartridgeState,
  ): CartridgeState | void;
}

export interface SoundBackgroundsConfig {
  canvasParent?: string | HTMLElement;
  frameRate?: number;
  backgroundColor?: number | [number, number, number];
}

export interface SoundBackgrounds {
  initialize(config?: SoundBackgroundsConfig): Promise<SoundBackgrounds>;
  registerCartridge(cartridge: Cartridge): Promise<SoundBackgrounds>;
}

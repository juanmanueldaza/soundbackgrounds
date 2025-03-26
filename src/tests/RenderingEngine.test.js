import { describe, it, expect, vi, beforeEach } from "vitest";
import { RenderingEngine, DrawingContext } from "../rendering/RenderingEngine";

describe("RenderingEngine", () => {
  it("should create a drawing context", () => {
    const mockP5 = {
      createCanvas: vi.fn().mockReturnValue({ parent: vi.fn() }),
      resizeCanvas: vi.fn(),
      width: 800,
      height: 600,
    };

    const engine = new RenderingEngine(mockP5);
    engine.initialize();

    const ctx = engine.getDrawingContext();
    expect(ctx).toBeInstanceOf(DrawingContext);
  });
});

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

  describe("DrawingContext", () => {
    it("should validate and clamp numeric parameters", () => {
      const mockP5 = {
        rect: vi.fn(),
        ellipse: vi.fn()
      };
      
      const ctx = new DrawingContext(mockP5);
      
      // Should handle valid parameters
      expect(() => ctx.rect(0, 0, 100, 100)).not.toThrow();
      
      // Should reject invalid parameters
      expect(() => ctx.rect(NaN, 0, 100, 100)).toThrow();
      expect(() => ctx.rect(Infinity, 0, 100, 100)).toThrow();
      
      // Should clamp extreme values
      ctx.rect(1e10, -1e10, 100, 100);
      expect(mockP5.rect).toHaveBeenCalledWith(1e6, -1e6, 100, 100);
    });
  });
});

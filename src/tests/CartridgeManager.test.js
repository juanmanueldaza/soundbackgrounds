import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartridgeManager } from "../cartridge/CartridgeManager";

describe("CartridgeManager", () => {
  let manager;

  beforeEach(() => {
    manager = new CartridgeManager();
  });

  it("should register a cartridge", () => {
    const mockCartridge = {
      setupCartridge: vi.fn(),
      drawCartridge: vi.fn(),
    };

    const id = manager.registerCartridge(mockCartridge);

    // Verify the cartridge was added to the array
    expect(manager.cartridges.length).toBe(1);
    expect(manager.cartridges[0].cartridge).toBe(mockCartridge);

    // Verify an ID was generated and state map was initialized
    expect(typeof id).toBe("string");
    expect(manager.cartridgeStates.has(id)).toBe(true);
  });

  it("should support multiple cartridges", () => {
    const manager = new CartridgeManager();

    const cartridge1 = {
      setupCartridge: vi.fn().mockReturnValue({ value: 1 }),
      drawCartridge: vi.fn((ctx, data, w, h, state) => ({
        value: state.value + 1,
      })),
    };

    const cartridge2 = {
      setupCartridge: vi.fn().mockReturnValue({ count: 10 }),
      drawCartridge: vi.fn((ctx, data, w, h, state) => ({
        count: state.count - 1,
      })),
    };

    const id1 = manager.registerCartridge(cartridge1);
    const id2 = manager.registerCartridge(cartridge2);

    expect(manager.cartridges.length).toBe(2);

    manager.setupCartridge({});
    manager.drawCartridge({}, [], 800, 600);

    expect(manager.cartridgeStates.get(id1).value).toBe(2);
    expect(manager.cartridgeStates.get(id2).count).toBe(9);

    // Test removing a cartridge
    manager.removeCartridge(id1);
    expect(manager.cartridges.length).toBe(1);
    expect(manager.cartridgeStates.has(id1)).toBe(false);
  });

  it("should maintain cartridge state between frames", () => {
    const initialState = { counter: 0 };
    const mockCartridge = {
      setupCartridge: vi.fn().mockReturnValue(initialState),
      drawCartridge: vi.fn((ctx, data, width, height, state) => {
        return { counter: state.counter + 1 };
      }),
    };

    // Register the cartridge and get its ID
    const id = manager.registerCartridge(mockCartridge);
    manager.setupCartridge({});

    // Simulate a few animation frames
    manager.drawCartridge({}, [], 800, 600);
    manager.drawCartridge({}, [], 800, 600);
    manager.drawCartridge({}, [], 800, 600);

    // Check the state in the Map using the cartridge ID
    expect(manager.cartridgeStates.get(id).counter).toBe(3);
  });
});

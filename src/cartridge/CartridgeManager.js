/**
 * Manages visualization cartridges and their states
 */
export class CartridgeManager {
  constructor() {
    this.cartridges = []; // Array of {id, cartridge} objects
    this.cartridgeStates = new Map(); // Map of id -> state
  }

  /**
   * Registers a new cartridge
   * @param {Cartridge} cartridge - The cartridge to register
   * @returns {string} Unique ID for the registered cartridge
   */
  registerCartridge(cartridge) {
    // Generate unique ID (simplified version if crypto is not available)
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "_" + Math.random().toString(36).substring(2, 11);

    this.cartridges.push({ id, cartridge });
    this.cartridgeStates.set(id, {});

    return id;
  }

  /**
   * Removes a cartridge by ID
   * @param {string} id - The cartridge ID to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeCartridge(id) {
    const initialLength = this.cartridges.length;
    this.cartridges = this.cartridges.filter((c) => c.id !== id);
    this.cartridgeStates.delete(id);

    return this.cartridges.length < initialLength;
  }

  /**
   * Sets up all registered cartridges
   * @param {DrawingContext} drawingContext - The drawing context
   */
  setupCartridge(drawingContext) {
    for (const { id, cartridge } of this.cartridges) {
      if (cartridge.setupCartridge) {
        // Initialize state for this cartridge
        const initialState = cartridge.setupCartridge(drawingContext) || {};
        this.cartridgeStates.set(id, initialState);
      }
    }
  }

  /**
   * Draws all registered cartridges
   * @param {DrawingContext} drawingContext - The drawing context
   * @param {number[]} audioData - Audio spectrum data
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawCartridge(drawingContext, audioData, width, height) {
    for (const { id, cartridge } of this.cartridges) {
      if (cartridge.drawCartridge) {
        const currentState = this.cartridgeStates.get(id) || {};

        // Draw and get updated state
        const updatedState =
          cartridge.drawCartridge(
            drawingContext,
            audioData,
            width,
            height,
            currentState,
          ) || currentState;

        // Store updated state
        this.cartridgeStates.set(id, updatedState);
      }
    }
  }
}

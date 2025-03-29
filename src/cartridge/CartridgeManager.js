import { CartridgeValidator } from '../security/CartridgeValidator.js';
import { RateLimiter } from '../security/RateLimiter.js';

/**
 * @typedef {Object} Cartridge
 * @property {Function} setupCartridge - Initial setup function
 * @property {Function} drawCartridge - Drawing function
 */

/**
 * Manages cartridge lifecycle and state
 */
export class CartridgeManager {
  constructor() {
    this.cartridges = []; // Array of {id, cartridge} objects
    this.cartridgeStates = new Map(); // Map of id -> state
    this.rateLimiter = new RateLimiter(100, 60000); // Maximum 100 operations per minute
    this.activeOperations = new Set();
  }

  /**
   * Registers a new cartridge
   * @param {Cartridge} cartridge - The cartridge to register
   * @returns {string} Unique ID for the registered cartridge
   * @throws {Error} If registration limit is exceeded or cartridge is invalid
   */
  registerCartridge(cartridge) {
    if (!this.rateLimiter.isAllowed('register')) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    // Validate cartridge
    CartridgeValidator.validateCartridge(cartridge);

    // Generate secure ID
    const id = crypto.randomUUID();

    // Timeout for operations
    const operationTimeout = setTimeout(() => {
      if (this.activeOperations.has(id)) {
        this.removeCartridge(id);
        throw new Error('Operation timeout');
      }
    }, 30000);

    this.activeOperations.add(id);

    try {
      this.cartridges.push({ id, cartridge });
      this.cartridgeStates.set(id, {});
      return id;
    } finally {
      clearTimeout(operationTimeout);
      this.activeOperations.delete(id);
    }
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
    if (!this.rateLimiter.isAllowed('draw')) {
      console.warn('Drawing rate limit exceeded');
      return;
    }

    // Sanitize audio data
    const sanitizedAudioData = this._sanitizeAudioData(audioData);

    for (const { id, cartridge } of this.cartridges) {
      if (cartridge.drawCartridge) {
        const currentState = this.cartridgeStates.get(id) || {};

        // Draw and get updated state
        const updatedState =
          cartridge.drawCartridge(
            drawingContext,
            sanitizedAudioData,
            width,
            height,
            currentState,
          ) || currentState;

        // Store updated state
        this.cartridgeStates.set(id, updatedState);
      }
    }
  }

  /**
   * Sanitizes audio data
   * @param {number[]} audioData - Audio spectrum data
   * @returns {Float32Array} Sanitized audio data
   */
  _sanitizeAudioData(audioData) {
    if (!Array.isArray(audioData)) return new Float32Array(1024);
    return audioData.map(value => 
      Math.min(Math.max(Number(value) || 0, 0), 255)
    );
  }
}

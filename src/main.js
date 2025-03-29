import p5 from "p5";
import { AudioManager } from "./audio/AudioManager.js";
import { RenderingEngine } from "./rendering/RenderingEngine.js";
import { CartridgeManager } from "./cartridge/CartridgeManager.js";

// Updated security constants
const SECURITY_CONSTANTS = {
  MAX_FRAME_RATE: 120,
  MIN_FRAME_RATE: 1,
  DEFAULT_FRAME_RATE: 60,
  MAX_BIN_COUNT: 2048,
  MIN_BIN_COUNT: 32,
  DEFAULT_BIN_COUNT: 1024,
  MAX_CARTRIDGES: 10,
  OPERATION_TIMEOUT: 30000,
  MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
};

class SoundBackgrounds {
  constructor() {
    this.p5Instance = null;
    this.audioManager = new AudioManager();
    this.renderingEngine = null;
    this.cartridgeManager = new CartridgeManager();
    this.isInitialized = false;
    this._cleanupCallbacks = [];
    this._validateEnvironment();
    this._setupMemoryProtection();
  }

  _validateEnvironment() {
    if (typeof window !== 'undefined') {
      // Verificar contexto seguro
      if (!window.isSecureContext) {
        throw new Error('SoundBackgrounds requiere un contexto seguro (HTTPS/localhost)');
      }

      // Verificar soporte de APIs requeridas
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta las APIs de audio requeridas');
      }
    }
  }

  _setupMemoryProtection() {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        const usedMemory = performance.memory?.usedJSHeapSize || 0;
        if (usedMemory > SECURITY_CONSTANTS.MEMORY_LIMIT) {
          console.warn('Límite de memoria excedido, limpiando...');
          this.destroy().catch(console.error);
        }
      }, 10000);

      // Limpiar intervalo al destruir
      this._cleanupCallbacks.push(() => clearInterval(interval));
    }
  }

  _sanitizeConfig(config = {}) {
    return {
      frameRate: Math.min(
        Math.max(config.frameRate || SECURITY_CONSTANTS.DEFAULT_FRAME_RATE,
        SECURITY_CONSTANTS.MIN_FRAME_RATE),
        SECURITY_CONSTANTS.MAX_FRAME_RATE
      ),
      audioBinCount: Math.min(
        Math.max(config.audioBinCount || SECURITY_CONSTANTS.DEFAULT_BIN_COUNT,
        SECURITY_CONSTANTS.MIN_BIN_COUNT),
        SECURITY_CONSTANTS.MAX_BIN_COUNT
      ),
      audioSmoothing: Math.min(Math.max(config.audioSmoothing || 0.8, 0), 1),
      canvasParent: this._validateParentElement(config.canvasParent)
    };
  }

  _validateParentElement(parent) {
    if (!parent) return document.body;
    if (typeof parent === 'string') {
      const element = document.querySelector(parent);
      if (!element) throw new Error('Invalid parent element selector');
      return element;
    }
    if (!(parent instanceof HTMLElement)) {
      throw new Error('Parent must be a valid HTMLElement');
    }
    return parent;
  }

  async initialize(config = {}) {
    if (this.isInitialized) {
      return this;
    }

    const sanitizedConfig = this._sanitizeConfig(config);

    // Load p5.js if needed
    if (typeof window !== "undefined" && !window.p5) {
      window.p5 = p5;
      if (process.env.NODE_ENV !== "test") {
        try {
          await import("p5/lib/addons/p5.sound.js");
        } catch (error) {
          console.error("Failed to load p5.sound.js", error);
          throw new Error("Could not initialize audio capabilities");
        }
      }
    }

    // Create p5 instance
    return new Promise((resolve) => {
      this.p5Instance = new p5((p) => {
        // Store reference
        const renderingEngine = new RenderingEngine(p);
        this.renderingEngine = renderingEngine;

        // Setup function
        p.setup = async () => {
          // Initialize canvas
          renderingEngine.initialize(sanitizedConfig.canvasParent);

          // Set frame rate
          p.frameRate(sanitizedConfig.frameRate);

          // Initialize audio with options
          const audioAnalyzer = await this.audioManager.initialize(p, {
            smoothing: sanitizedConfig.audioSmoothing,
            binCount: sanitizedConfig.audioBinCount,
          });

          // Mark as initialized
          this.isInitialized = true;
          resolve(this);
        };

        // The draw function remains the same
        // ...
      });
    });
  }

  /**
   * Registers a visualization cartridge
   * @param {Cartridge} cartridge - The cartridge to register
   * @returns {Promise<{soundbackgrounds: SoundBackgrounds, id: string}>} This instance and cartridge id
   */
  async registerCartridge(cartridge) {
    // Verify cartridge limit
    if (this.cartridgeManager.cartridges.length >= SECURITY_CONSTANTS.MAX_CARTRIDGES) {
      throw new Error('Maximum number of cartridges reached');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const id = this.cartridgeManager.registerCartridge(cartridge);

    // Setup the cartridge
    const ctx = this.renderingEngine.getDrawingContext();
    this.cartridgeManager.setupCartridge(ctx);

    return { soundbackgrounds: this, id };
  }

  /**
   * Removes a registered cartridge
   * @param {string} id - The cartridge ID to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeCartridge(id) {
    return this.cartridgeManager.removeCartridge(id);
  }

  /**
   * Cleans up resources and stops audio processing
   * @returns {Promise<SoundBackgrounds>} This instance
   */
  async destroy() {
    // Stop audio capture if active
    if (this.audioManager?.audioSource) {
      try {
        this.audioManager.audioSource.stop();
      } catch (error) {
        console.warn("Error stopping audio source:", error);
      }
    }

    // Remove p5 instance
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }

    // Reset state
    this.renderingEngine = null;
    this.isInitialized = false;

    // Execute cleanup callbacks
    if (this._cleanupCallbacks) {
      this._cleanupCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Cleanup callback failed:', error);
        }
      });
      this._cleanupCallbacks = [];
    }

    return this;
  }
}

// Deep freeze to prevent modifications
const soundbackgrounds = Object.freeze(
  Object.create(
    new SoundBackgrounds(),
    Object.getOwnPropertyDescriptors(new SoundBackgrounds())
  )
);

export default soundbackgrounds;

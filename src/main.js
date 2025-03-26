import p5 from "p5";
import { AudioManager } from "./audio/AudioManager.js";
import { RenderingEngine } from "./rendering/RenderingEngine.js";
import { CartridgeManager } from "./cartridge/CartridgeManager.js";

// Configuration constants
const DEFAULT_FRAME_RATE = 60;
const DEFAULT_BACKGROUND = 0; // Black

class SoundBackgrounds {
  constructor() {
    this.p5Instance = null;
    this.audioManager = new AudioManager();
    this.renderingEngine = null;
    this.cartridgeManager = new CartridgeManager();
    this.isInitialized = false;
  }

  async initialize(config = {}) {
    if (this.isInitialized) {
      return this;
    }

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
          renderingEngine.initialize(config.canvasParent);

          // Set frame rate
          p.frameRate(config.frameRate || DEFAULT_FRAME_RATE);

          // Initialize audio with options
          const audioAnalyzer = await this.audioManager.initialize(p, {
            smoothing: config.audioSmoothing,
            binCount: config.audioBinCount,
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

    return this;
  }
}

// Export singleton
const soundbackgrounds = new SoundBackgrounds();
export default soundbackgrounds;

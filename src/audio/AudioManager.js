/**
 * Manages audio input and frequency analysis
 */
export class AudioManager {
  constructor() {
    this.analyzer = null;
    this.audioSource = null;
  }

  /**
   * Initializes audio input and analysis
   * @param {object} p5Instance - p5.js instance
   * @param {object} options - Audio configuration options
   * @param {number} [options.smoothing=0.8] - FFT smoothing value (0-1)
   * @param {number} [options.binCount=1024] - Number of frequency bins
   * @returns {Promise<AudioAnalyzer>} Audio analyzer instance
   */
  async initialize(p5Instance, options = {}) {
    if (process.env.NODE_ENV === "test") {
      return new MockAudioAnalyzer();
    }

    await this._ensureAudioLibraryLoaded();

    // Create audio source and analyzer
    const mic = new p5Instance.AudioIn();
    const fft = new p5Instance.FFT(
      options.smoothing || 0.8,
      options.binCount || 1024,
    );
    mic.start();
    fft.setInput(mic);

    this.analyzer = fft;
    this.audioSource = mic;

    return new P5AudioAnalyzer(this.analyzer);
  }

  /**
   * Ensures p5.sound library is loaded
   * @private
   * @returns {Promise<void>}
   */
  async _ensureAudioLibraryLoaded() {
    // Logic to ensure p5.sound is loaded
    if (typeof window !== "undefined" && !window.p5.AudioIn) {
      return new Promise((resolve) => {
        const checkAudio = setInterval(() => {
          if (window.p5.AudioIn) {
            clearInterval(checkAudio);
            resolve();
          }
        }, 100);
      });
    }
  }
}

// Audio analyzer interface
export class AudioAnalyzer {
  analyze() {
    throw new Error("Method not implemented");
  }
}

// p5.js implementation
export class P5AudioAnalyzer extends AudioAnalyzer {
  constructor(fft) {
    super();
    this.fft = fft;
  }

  analyze() {
    return this.fft.analyze();
  }
}

// Mock implementation for testing
export class MockAudioAnalyzer extends AudioAnalyzer {
  analyze() {
    return Array(128)
      .fill(0)
      .map(() => Math.floor(Math.random() * 255));
  }
}

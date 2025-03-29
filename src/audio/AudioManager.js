/**
 * Manages audio input and frequency analysis
 */
export class AudioManager {
  constructor() {
    this.analyzer = null;
    this.audioSource = null;
    this._metrics = {
      drops: 0,
      totalSamples: 0,
      peakLevel: 0
    };
  }

  /**
   * Validate audio permissions and security constraints
   * @private
   */
  async _validateSecurity() {
    // Verify if we're in a secure context (HTTPS)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      throw new Error('Audio capture requires HTTPS for security reasons');
    }

    // Explicitly verify permissions
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      if (permissionStatus.state === 'denied') {
        throw new Error('Microphone access denied');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      throw new Error('Could not verify microphone permissions');
    }
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

    try {
      await this._validateSecurity();
      await this._ensureAudioLibraryLoaded();

      // Sanitize options
      const sanitizedOptions = {
        smoothing: Math.min(Math.max(options.smoothing || 0.8, 0), 1),
        binCount: Math.min(Math.max(options.binCount || 1024, 32), 2048)
      };

      // Create audio source and analyzer with improved error handling
      const mic = new p5Instance.AudioIn();
      const fft = new p5Instance.FFT(
        sanitizedOptions.smoothing,
        sanitizedOptions.binCount
      );

      await new Promise((resolve, reject) => {
        mic.start(() => resolve(), (error) => reject(error));
      });

      fft.setInput(mic);
      this.analyzer = fft;
      this.audioSource = mic;

      // Add monitoring
      setInterval(() => this._reportMetrics(), 5000);

      return new P5AudioAnalyzer(this.analyzer);
    } catch (error) {
      console.error('Audio initialization failed:', error);
      throw new Error('Could not initialize audio system securely');
    }
  }

  /**
   * Ensures p5.sound library is loaded
   * @private
   * @returns {Promise<void>}
   */
  async _ensureAudioLibraryLoaded() {
    if (typeof window === "undefined" || window.p5?.AudioIn) {
      return;
    }

    const MAX_WAIT_TIME = 5000;
    const CHECK_INTERVAL = 50;
    let elapsedTime = 0;

    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.p5?.AudioIn) {
          return resolve();
        }
        
        elapsedTime += CHECK_INTERVAL;
        if (elapsedTime >= MAX_WAIT_TIME) {
          reject(new Error('p5.sound library load timeout'));
          return;
        }
        
        requestAnimationFrame(check);
      };
      
      requestAnimationFrame(check);
    });
  }

  /**
   * Reports audio metrics
   * @private
   */
  _reportMetrics() {
    const dropRate = (this._metrics.drops / Math.max(this._metrics.totalSamples, 1)) * 100;
    if (dropRate > 5) {
      console.warn(`Audio drops: ${dropRate.toFixed(2)}% - Peak level: ${this._metrics.peakLevel}`);
    }
    this._metrics = { drops: 0, totalSamples: 0, peakLevel: 0 };
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
    const data = this.fft.analyze();
    this._updateMetrics(data);
    return data;
  }

  /**
   * Updates audio metrics
   * @private
   * @param {Array<number>} data - Frequency data
   */
  _updateMetrics(data) {
    const peak = Math.max(...data);
    this._metrics.totalSamples++;
    this._metrics.peakLevel = Math.max(this._metrics.peakLevel, peak);
    if (peak < 1) this._metrics.drops++;
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

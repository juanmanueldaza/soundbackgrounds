/**
 * Manages the rendering context and canvas operations
 */
export class RenderingEngine {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.width = 0;
    this.height = 0;
  }

  initialize(canvasParent = document.body) {
    this.canvas = this.p.createCanvas(this.p.windowWidth, this.p.windowHeight);

    // Use provided parent or fall back to document.body
    if (canvasParent) {
      this.canvas.parent(canvasParent);
    }

    this.width = this.p.width;
    this.height = this.p.height;

    // Add resize handling
    this.p.windowResized = () => {
      this.p.resizeCanvas(this.p.windowWidth, this.p.windowHeight);
      this.width = this.p.width;
      this.height = this.p.height;
    };
  }

  getDrawingContext() {
    return new DrawingContext(this.p);
  }

  clear() {
    this.p.background(0);
  }

  getDimensions() {
    return {
      width: this.width,
      height: this.height,
    };
  }
}

/**
 * Provides a safe drawing context with parameter validation
 */
export class DrawingContext {
  /**
   * Creates a new drawing context
   * @param {p5} p - The p5.js instance
   */
  constructor(p) {
    this.p = p;
    this._paramBuffer = new Float64Array(6); // Pre-allocate buffer for params
    this._colorBuffer = new Uint8Array(4);   // Pre-allocate buffer for colors
  }

  /**
   * Disables stroke for shapes
   */
  noStroke() {
    this.p.noStroke();
  }

  /**
   * Sets the stroke color
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @param {number} [a=255] - Alpha component (0-255)
   */
  stroke(r, g, b, a = 255) {
    this.p.stroke(r, g, b, a);
  }

  /**
   * Sets the stroke weight
   * @param {number} weight - Stroke weight
   */
  strokeWeight(weight) {
    this.p.strokeWeight(weight);
  }

  /**
   * Sets the fill color
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @param {number} [a=255] - Alpha component (0-255)
   */
  fill(r, g, b, a = 255) {
    this.p.fill(r, g, b, a);
  }

  /**
   * Disables fill for shapes
   */
  noFill() {
    this.p.noFill();
  }

  /**
   * Draws a rectangle with validated parameters
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} w - Width
   * @param {number} h - Height
   * @throws {Error} If parameters are invalid
   */
  rect(x, y, w, h) {
    if (!this._validateNumericParams([x, y, w, h])) {
      throw new Error('Invalid parameters for rect');
    }
    this.p.rect(
      this._clampValue(x),
      this._clampValue(y),
      this._clampValue(Math.abs(w)), // Prevent negative dimensions
      this._clampValue(Math.abs(h))
    );
  }

  /**
   * Draws an ellipse with validated parameters
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} w - Width
   * @param {number} h - Height
   * @throws {Error} If parameters are invalid
   */
  ellipse(x, y, w, h) {
    if (!this._validateNumericParams([x, y, w, h])) {
      throw new Error('Invalid parameters for ellipse');
    }
    this.p.ellipse(x, y, w, h);
  }

  /**
   * Draws a line with validated parameters
   * @param {number} x1 - X coordinate of the start point
   * @param {number} y1 - Y coordinate of the start point
   * @param {number} x2 - X coordinate of the end point
   * @param {number} y2 - Y coordinate of the end point
   * @throws {Error} If parameters are invalid
   */
  line(x1, y1, x2, y2) {
    if (!this._validateNumericParams([x1, y1, x2, y2])) {
      throw new Error('Invalid parameters for line');
    }
    this.p.line(x1, y1, x2, y2);
  }

  /**
   * Draws a triangle with validated parameters
   * @param {number} x1 - X coordinate of the first vertex
   * @param {number} y1 - Y coordinate of the first vertex
   * @param {number} x2 - X coordinate of the second vertex
   * @param {number} y2 - Y coordinate of the second vertex
   * @param {number} x3 - X coordinate of the third vertex
   * @param {number} y3 - Y coordinate of the third vertex
   * @throws {Error} If parameters are invalid
   */
  triangle(x1, y1, x2, y2, x3, y3) {
    if (!this._validateNumericParams([x1, y1, x2, y2, x3, y3])) {
      throw new Error('Invalid parameters for triangle');
    }
    this.p.triangle(x1, y1, x2, y2, x3, y3);
  }

  /**
   * Maps a value from one range to another
   * @param {number} value - The value to map
   * @param {number} start1 - Lower bound of the source range
   * @param {number} stop1 - Upper bound of the source range
   * @param {number} start2 - Lower bound of the target range
   * @param {number} stop2 - Upper bound of the target range
   * @returns {number} The mapped value
   */
  map(value, start1, stop1, start2, stop2) {
    return this.p.map(value, start1, stop1, start2, stop2);
  }

  /**
   * Creates a color object
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @param {number} [a=255] - Alpha component (0-255)
   * @returns {p5.Color} The created color object
   */
  color(r, g, b, a = 255) {
    this._colorBuffer[0] = this._clampValue(r, 0, 255);
    this._colorBuffer[1] = this._clampValue(g, 0, 255);
    this._colorBuffer[2] = this._clampValue(b, 0, 255);
    this._colorBuffer[3] = this._clampValue(a, 0, 255);
    return this.p.color(...this._colorBuffer);
  }

  /**
   * Interpolates between two colors
   * @param {p5.Color} c1 - The first color
   * @param {p5.Color} c2 - The second color
   * @param {number} amt - The interpolation amount (0-1)
   * @returns {p5.Color} The interpolated color
   */
  lerpColor(c1, c2, amt) {
    return this.p.lerpColor(c1, c2, amt);
  }

  /**
   * Validates numeric parameters
   * @param {number[]} params - The parameters to validate
   * @returns {boolean} True if all parameters are valid, false otherwise
   */
  _validateNumericParams(params) {
    this._paramBuffer.set(params);
    return !this._paramBuffer.subarray(0, params.length)
      .some(param => !Number.isFinite(param));
  }

  /**
   * Clamps a value within a specified range
   * @param {number} value - The value to clamp
   * @param {number} [min=-1e6] - The minimum value
   * @param {number} [max=1e6] - The maximum value
   * @returns {number} The clamped value
   */
  _clampValue(value, min = -1e6, max = 1e6) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }
}

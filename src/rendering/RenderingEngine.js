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

export class DrawingContext {
  constructor(p) {
    this.p = p;
  }

  noStroke() {
    this.p.noStroke();
  }
  stroke(r, g, b, a = 255) {
    this.p.stroke(r, g, b, a);
  }
  strokeWeight(weight) {
    this.p.strokeWeight(weight);
  }
  fill(r, g, b, a = 255) {
    this.p.fill(r, g, b, a);
  }
  noFill() {
    this.p.noFill();
  }
  rect(x, y, w, h) {
    this.p.rect(x, y, w, h);
  }
  ellipse(x, y, w, h) {
    this.p.ellipse(x, y, w, h);
  }
  line(x1, y1, x2, y2) {
    this.p.line(x1, y1, x2, y2);
  }
  triangle(x1, y1, x2, y2, x3, y3) {
    this.p.triangle(x1, y1, x2, y2, x3, y3);
  }
  map(value, start1, stop1, start2, stop2) {
    return this.p.map(value, start1, stop1, start2, stop2);
  }

  // Add color utilities
  color(r, g, b, a = 255) {
    return this.p.color(r, g, b, a);
  }
  lerpColor(c1, c2, amt) {
    return this.p.lerpColor(c1, c2, amt);
  }
}

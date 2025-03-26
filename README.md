# soundbackgrounds

A framework-agnostic library for creating beautiful, interactive visualizations that react to sound input in real-time. Designed with a modular "cartridge" system that makes it easy to create custom visualizations without dealing with the complexities of audio processing.

## Features

- Real-time audio analysis from microphone input
- Simple drawing API based on p5.js
- Modular cartridge system for creating custom visualizations
- Responsive design that adapts to any screen size
- Zero configuration to get started
- Support for multiple layered visualizations
- State management for complex animations

## Installation

```bash
npm install soundbackgrounds
```

## Quick Start

1. Set up your project for ES modules:

```json
{
  "type": "module"
}
```

2. Create a basic HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Visualization</title>
</head>
<body>
    <script type="module" src="./index.js"></script>
</body>
</html>
```

3. Create your visualization in `index.js`:

```javascript
import soundbackgrounds from 'soundbackgrounds';

// Create a simple visualization that reacts to sound
soundbackgrounds.registerCartridge({
    // Setup runs once at initialization
    setupCartridge: (ctx) => {
        console.log('Visualization ready!');
    },

    // Draw runs continuously with audio data
    drawCartridge: (ctx, spectrum, width, height) => {
        // Create a colorful spectrum analyzer
        ctx.noStroke();

        spectrum.forEach((value, index) => {
            // Map frequency values to canvas position and size
            const x = ctx.map(index, 0, spectrum.length, 0, width);
            const barWidth = width / spectrum.length;
            const barHeight = ctx.map(value, 0, 255, 0, height);

            // Color based on frequency
            const hue = ctx.map(index, 0, spectrum.length, 0, 360);
            ctx.fill(hue, 100, 50);

            // Draw the bar
            ctx.rect(x, height - barHeight, barWidth, barHeight);
        });
    }
}).catch(error => {
    console.error('Error initializing sound visualization:', error);
});
```

## Using with Frameworks

### Vite (Recommended)

Configure your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        open: true
    }
});
```

### Others

Works seamlessly with React, Vue, Angular, and other modern frameworks. Simply import and use as shown in the example above.

## Configuration Options

When initializing soundbackgrounds, you can pass configuration options:

```javascript
await soundbackgrounds.initialize({
    // Canvas parent element (string selector or HTMLElement)
    canvasParent: document.getElementById('visualization-container'),

    // Animation frame rate (default: 60)
    frameRate: 30,

    // Background color (RGB array or single value for grayscale)
    backgroundColor: [0, 0, 0],

    // Audio analysis options
    audioSmoothing: 0.8,  // FFT smoothing (0-1)
    audioBinCount: 1024   // Number of frequency bins
});
```

## API Reference

### DrawingContext

The `ctx` object provides a simplified subset of p5.js drawing functions:

| Method | Description |
|--------|-------------|
| `noStroke()` | Disables drawing stroke (outlines) |
| `stroke(r, g, b, a)` | Sets stroke color (RGB or RGBA values) |
| `strokeWeight(weight)` | Sets stroke thickness |
| `fill(r, g, b, a)` | Sets fill color (RGB or RGBA values) |
| `noFill()` | Disables fill |
| `rect(x, y, width, height)` | Draws a rectangle |
| `ellipse(x, y, width, height)` | Draws an ellipse |
| `line(x1, y1, x2, y2)` | Draws a line |
| `triangle(x1, y1, x2, y2, x3, y3)` | Draws a triangle |
| `map(value, start1, stop1, start2, stop2)` | Maps a value from one range to another |
| `color(r, g, b, a)` | Creates a color object |
| `lerpColor(c1, c2, amt)` | Linearly interpolates between two colors |

### Cartridge Interface

```typescript
interface Cartridge {
    setupCartridge(ctx: DrawingContext): CartridgeState | void;
    drawCartridge(
        ctx: DrawingContext,
        spectrum: number[],
        width: number,
        height: number,
        state: CartridgeState
    ): CartridgeState | void;
}

interface CartridgeState {
    [key: string]: any;
}
```

- `setupCartridge`: Called once when the visualization is initialized
  - Return an object to initialize the cartridge's state
- `drawCartridge`: Called continuously in the animation loop
  - `spectrum`: Array of frequency values (0-255) from audio analysis
  - `width` & `height`: Current canvas dimensions
  - `state`: Current state from previous frame
  - Return an object to update the state for the next frame

## Examples

### Stateful Particle Visualization

```javascript
soundbackgrounds.registerCartridge({
    setupCartridge: (ctx) => {
        // Return initial state
        return {
            particles: Array(100).fill().map(() => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 2 + 1
            })),
            hue: 0
        };
    },

    drawCartridge: (ctx, spectrum, width, height, state) => {
        // Clear with fading effect
        ctx.fill(0, 0, 0, 20);
        ctx.rect(0, 0, width, height);

        // Calculate average volume
        const avgVolume = spectrum.reduce((sum, val) => sum + val, 0) / spectrum.length;

        // Update and draw particles
        const updatedParticles = state.particles.map(particle => {
            // Update particle based on audio
            const newSize = particle.size + (avgVolume / 255) * 10;

            // Move particle
            let newY = particle.y - particle.speed;
            if (newY < -50) newY = height + 50;

            // Draw particle
            const particleHue = (state.hue + particle.x % 60) % 360;
            ctx.fill(particleHue, 100, 100);
            ctx.noStroke();
            ctx.ellipse(particle.x, newY, newSize, newSize);

            // Return updated particle
            return {
                ...particle,
                y: newY,
                size: particle.size  // Keep original size for next frame
            };
        });

        // Return updated state
        return {
            particles: updatedParticles,
            hue: (state.hue + 0.5) % 360
        };
    }
});
```

### Multiple Layered Visualizations

```javascript
// Register a background cartridge
const { id: backgroundId } = await soundbackgrounds.registerCartridge({
  setupCartridge: (ctx) => {
    return { hue: 0 };
  },
  drawCartridge: (ctx, spectrum, width, height, state) => {
    // Create a slowly changing background
    const bgHue = (state.hue + 0.1) % 360;
    ctx.fill(bgHue, 50, 20, 10); // Low opacity for gradual fade
    ctx.rect(0, 0, width, height);

    return { hue: bgHue };
  }
});

// Register a foreground visualization
const { id: visualizerId } = await soundbackgrounds.registerCartridge({
  setupCartridge: (ctx) => {
    return {
      points: Array(20).fill().map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
    };
  },
  drawCartridge: (ctx, spectrum, width, height, state) => {
    // Draw visualization elements
    ctx.noFill();
    ctx.stroke(255, 255, 255);
    ctx.strokeWeight(2);

    // Connect points based on audio levels
    const points = [...state.points];
    for (let i = 0; i < points.length; i++) {
      const freqIndex = Math.floor(i * spectrum.length / points.length);
      const intensity = spectrum[freqIndex] / 255;

      // Draw connections based on audio intensity
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (distance < 200 * intensity) {
          ctx.line(points[i].x, points[i].y, points[j].x, points[j].y);
        }
      }
    }

    // Return current state
    return { points };
  }
});

// Later, remove visualizations if needed
soundbackgrounds.removeCartridge(backgroundId);
```

## Advanced Usage

### Cleanup Resources

When you're done with the visualization, you can clean up resources:

```javascript
// Stop audio processing and remove canvas
await soundbackgrounds.destroy();
```

### Custom Audio Settings

Fine-tune audio analysis for your visualization:

```javascript
await soundbackgrounds.initialize({
  audioSmoothing: 0.6, // Less smoothing for more responsive visuals
  audioBinCount: 512   // Fewer bins for better performance
});
```

## Local Development

```bash
git clone https://github.com/juanmanueldaza/soundbackgrounds.git
cd soundbackgrounds
npm install
npm run dev
```

## Browser Compatibility

Requires a modern browser with WebAudio API support. Works in:
- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)

## License

MIT

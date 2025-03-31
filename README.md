# SoundBackgrounds

> Real-time audio visualization framework with cartridge architecture and performance optimization.

## Installation

```bash
npm install soundbackgrounds
```

## Basic Usage

```typescript
import soundbackgrounds from 'soundbackgrounds';

const { id } = await soundbackgrounds.registerCartridge({
  setupCartridge: (ctx) => ({
    buffer: new Float32Array(1024),  // Pre-allocate buffer
    metrics: { frames: 0, drops: 0 }
  }),
  
  drawCartridge: (ctx, spectrum, width, height, state) => {
    // Copy spectrum data to pre-allocated buffer
    state.buffer.set(spectrum);
    
    // Optimized drawing with bounds checking
    state.buffer.forEach((value, i) => {
      const x = ctx._clampValue(i * width / state.buffer.length);
      const h = ctx._clampValue(value * height);
      ctx.rect(x, height - h, width / state.buffer.length, h);
    });
    
    return state;
  }
});
```

## API Reference

### Configuration

```typescript
interface SoundBackgroundsConfig {
  audioSmoothing: number;    // Range: 0-1, Default: 0.8
  audioBinCount: number;     // Range: 32-2048, Default: 1024
  frameRate: number;         // Range: 1-120, Default: 60
  memoryLimit: number;       // Bytes, Default: 100MB
}
```

### Real-Time Metrics

```typescript
interface RuntimeMetrics {
  audio: {
    drops: number;        // Lost frames
    peakLevel: number;    // Maximum level (0-255)
    sampleRate: number;   // Samples/second
  };
  performance: {
    fps: number;         // Current frames/second
    memory: number;      // Memory usage (bytes)
    cpuTime: number;     // ms/frame
  };
}
```

## Contributions

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development workflow
- Code standards
- PR process

# soundbackgrounds

Framework agnostic soundbackgrounds reactive to sound input. Users can load their own cartridges for visualizations.

## Installation

```bash
npm install soundbackgrounds
```

## Setup

1. Asegúrate de que tu proyecto use módulos ES:

```json
{
  "type": "module"
}
```

2. Si usas Vite (recomendado), configura tu `vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        open: true
    }
});
```

3. Configura tu HTML base:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Project</title>
</head>
<body>
    <script type="module" src="./index.js"></script>
</body>
</html>
```

## Usage

```javascript
import soundbackgrounds from 'soundbackgrounds';

soundbackgrounds.registerCartridge({
    // Setup se ejecuta una vez al inicio
    setupCartridge: (ctx) => {
        console.log('Custom cartridge setup');
    },
    // Draw se ejecuta continuamente
    drawCartridge: (ctx, spectrum, width, height) => {
        // ctx provee métodos de dibujo de p5.js
        ctx.noStroke();
        ctx.fill(255, 0, 0);
        
        // spectrum es un array con los valores del análisis de audio
        spectrum.forEach((value, index) => {
            const x = ctx.map(index, 0, spectrum.length, 0, width);
            const h = ctx.map(value, 0, 255, 0, height);
            ctx.rect(x, height - h, width / spectrum.length, h);
        });
    }
}).catch(error => {
    console.error('Error initializing soundbackgrounds:', error);
});
```

## API

### DrawingContext

El objeto `ctx` provee las siguientes funciones de p5.js:

- `noStroke()`: Deshabilita el borde de las formas
- `fill(r, g, b)`: Define el color de relleno (0-255)
- `rect(x, y, width, height)`: Dibuja un rectángulo
- `map(value, start1, stop1, start2, stop2)`: Mapea un valor de un rango a otro

### Spectrum

El array `spectrum` contiene los valores del análisis de frecuencia del audio (0-255).

## Development

Para desarrollo local:

```bash
git clone https://github.com/juanmanueldaza/soundbackgrounds.git
cd soundbackgrounds
npm install
npm run dev
```


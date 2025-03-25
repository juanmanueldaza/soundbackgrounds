import p5 from 'p5';

// Clase para el contexto de dibujo
class DrawingContext {
    constructor(p) {
        this.p = p;
    }

    noStroke() { this.p.noStroke(); }
    fill(r, g, b) { this.p.fill(r, g, b); }
    rect(x, y, w, h) { this.p.rect(x, y, w, h); }
    map(value, start1, stop1, start2, stop2) {
        return this.p.map(value, start1, stop1, start2, stop2);
    }
}

const soundbackgrounds = {
    p5Instance: null,
    drawingContext: null,

    async initialize() {
        if (typeof window !== 'undefined' && !window.p5) {
            window.p5 = p5;
            if (process.env.NODE_ENV !== 'test') {
                await import('p5/lib/addons/p5.sound.js');
            }
        }
        return this;
    },

    async registerCartridge(cartridge) {
        await this.initialize();

        return new Promise((resolve) => {
            const initSketch = () => {
                this.p5Instance = new p5((p) => {
                    this.drawingContext = new DrawingContext(p);
                    let audioContext = process.env.NODE_ENV === 'test' ? 
                        { analyze: () => Array(10).fill(128) } : 
                        this._setupAudio(p);

                    p.setup = () => {
                        p.createCanvas(p.windowWidth, p.windowHeight);
                        cartridge.setupCartridge(this.drawingContext);
                    };

                    p.draw = () => {
                        p.background(200);
                        const spectrum = audioContext.analyze();
                        cartridge.drawCartridge(this.drawingContext, spectrum, p.width, p.height);
                    };

                    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
                });
                resolve(this);
            };

            if (process.env.NODE_ENV === 'test' || window.p5.AudioIn) {
                initSketch();
            } else {
                const checkAudio = setInterval(() => {
                    if (window.p5.AudioIn) {
                        clearInterval(checkAudio);
                        initSketch();
                    }
                }, 100);
            }
        });
    },

    _setupAudio(p) {
        const mic = new p5.AudioIn();
        const fft = new p5.FFT();
        mic.start();
        fft.setInput(mic);
        return fft;
    }
};

export default soundbackgrounds;
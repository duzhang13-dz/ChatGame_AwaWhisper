import React, { useEffect, useRef } from 'react';
import { TimeOfDay } from '../types';

interface ForestCanvasProps {
    timeOfDay: TimeOfDay;
}

const ForestCanvas: React.FC<ForestCanvasProps> = ({ timeOfDay }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Color Palettes
  const PALETTES = {
    [TimeOfDay.MORNING]: {
        skyTop: '#fef9c3', // yellow-100
        skyBottom: '#bfdbfe', // blue-200
        mountain: '#57534e', // stone-600
        trees: ['#65a30d', '#4d7c0f', '#3f6212'], // lime
        trunk: '#5d4037',
        fireflies: false,
        celestial: { type: 'sun', color: '#fde047', y: 0.3 } // Rising sun
    },
    [TimeOfDay.DAY]: {
        skyTop: '#38bdf8', // sky-400
        skyBottom: '#bae6fd', // sky-200
        mountain: '#0f766e', // teal-700
        trees: ['#16a34a', '#15803d', '#166534'], // green
        trunk: '#3f2e26',
        fireflies: false,
        celestial: { type: 'sun', color: '#facc15', y: 0.15 } // High sun
    },
    [TimeOfDay.EVENING]: {
        skyTop: '#1e1b4b', // indigo-950
        skyBottom: '#fb923c', // orange-400
        mountain: '#431407', // brown-900
        trees: ['#854d0e', '#713f12', '#422006'], // dark gold/brown
        trunk: '#29150f',
        fireflies: true,
        celestial: { type: 'sun', color: '#ef4444', y: 0.6 } // Setting sun
    },
    [TimeOfDay.NIGHT]: {
        skyTop: '#020617', // slate-950
        skyBottom: '#0f172a', // slate-900
        mountain: '#022c22', // emerald-950
        trees: ['#064e3b', '#065f46', '#047857'], // emerald (original)
        trunk: '#1a120b',
        fireflies: true,
        celestial: { type: 'moon', color: '#fef3c7', y: 0.15 } // Moon
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = PALETTES[timeOfDay];

    // Pixel scale
    const scale = 4;
    let width = window.innerWidth / scale;
    let height = window.innerHeight / scale;
    
    const resize = () => {
        width = Math.ceil(window.innerWidth / scale);
        height = Math.ceil(window.innerHeight / scale);
        canvas.width = width;
        canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Trees data
    interface Tree {
        x: number;
        y: number;
        h: number;
        type: number;
        swayOffset: number;
    }
    
    const trees: Tree[] = [];
    const numTrees = 30;
    
    for(let i=0; i<numTrees; i++) {
        trees.push({
            x: Math.random() * width,
            y: height - (Math.random() * 50) + 10, // Near bottom
            h: 40 + Math.random() * 60,
            type: Math.floor(Math.random() * 3),
            swayOffset: Math.random() * Math.PI * 2
        });
    }

    // Sort trees by Y so lower ones are in front
    trees.sort((a, b) => a.y - b.y);

    let time = 0;

    const drawTree = (t: Tree, tTime: number) => {
        if (!ctx) return;
        
        // Sway calculation
        const sway = Math.sin(tTime + t.swayOffset) * 2;
        
        const trunkColor = palette.trunk; 
        const leafColors = palette.trees;

        // Trunk
        ctx.fillStyle = trunkColor;
        ctx.fillRect(Math.floor(t.x), Math.floor(t.y - t.h), 4, t.h);

        // Leaves (Simple pixel blobs)
        ctx.fillStyle = leafColors[t.type];
        
        // Draw a clustered foliage top
        const foliageSize = 16;
        const fx = Math.floor(t.x - foliageSize/2 + sway + 2);
        const fy = Math.floor(t.y - t.h - foliageSize + 5);
        
        // Pixel circle approximation
        ctx.fillRect(fx + 4, fy, 8, 2);
        ctx.fillRect(fx + 2, fy + 2, 12, 2);
        ctx.fillRect(fx, fy + 4, 16, 8);
        ctx.fillRect(fx + 2, fy + 12, 12, 2);
        ctx.fillRect(fx + 4, fy + 14, 8, 2);
    };

    const drawFireflies = (t: number) => {
        if (!ctx || !palette.fireflies) return;
        ctx.fillStyle = '#fbbf24'; // Amber glow
        for(let i=0; i<15; i++) {
            const x = (Math.sin(t * 0.5 + i) * width/2) + width/2;
            const y = (Math.cos(t * 0.3 + i * 2) * height/3) + height/2;
            // Blinking
            if (Math.sin(t * 3 + i) > 0) {
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            }
        }
    }

    const drawCelestial = (t: number) => {
        if (!ctx || !palette.celestial) return;
        const { type, color, y } = palette.celestial;
        const cx = width * 0.8;
        const cy = height * y;

        ctx.fillStyle = color;
        
        if (type === 'sun') {
             // Simple circle
            ctx.fillRect(cx - 6, cy - 2, 12, 4);
            ctx.fillRect(cx - 4, cy - 4, 8, 8);
            ctx.fillRect(cx - 2, cy - 6, 4, 12);
        } else {
            // Moon (crescent-ish or full)
            ctx.fillRect(cx - 3, cy - 3, 6, 6);
        }
    }

    const loop = () => {
        if (!ctx) return;
        time += 0.02;
        
        // Draw Sky Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(1, palette.skyBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw Celestial
        drawCelestial(time);

        // Distant mountains/canopy
        ctx.fillStyle = palette.mountain;
        for(let x=0; x<width; x+=4) {
            const h = 20 + Math.sin(x * 0.02) * 15;
            ctx.fillRect(x, height - 100 - h, 5, 100 + h);
        }

        // Draw trees
        trees.forEach(tree => drawTree(tree, time));

        // Draw fireflies
        drawFireflies(time);

        requestAnimationFrame(loop);
    };

    const animFrame = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animFrame);
    };
  }, [timeOfDay]); // Re-run when timeOfDay changes

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full z-0 pixel-antialiasing-off pointer-events-none transition-colors duration-1000 ease-in-out"
        style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default ForestCanvas;
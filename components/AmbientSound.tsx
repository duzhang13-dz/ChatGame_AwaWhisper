import React, { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  enabled: boolean;
  volume?: number;
}

export const AmbientSound: React.FC<AmbientSoundProps> = ({ enabled, volume = 0.3 }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalsRef = useRef<number[]>([]);

  useEffect(() => {
    if (enabled && !audioCtxRef.current) {
      // Initialize Audio Context on first enable (requires user interaction beforehand)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // --- LAYER 1: WIND (Pink Noise) ---
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Pink noise generation (Paul Kellett's refined method)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; 
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      noise.start(0);

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 300;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.7; // Boosted base gain

      noise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      // Wind Variation Loop
      const varyWind = () => {
        const t = ctx.currentTime;
        // Randomize filter freq for "gusts"
        windFilter.frequency.exponentialRampToValueAtTime(200 + Math.random() * 400, t + 3);
        // Randomize volume
        windGain.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.4, t + 3);
      };
      intervalsRef.current.push(window.setInterval(varyWind, 4000));

      // --- LAYER 2: DRONE (Base atmosphere) ---
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 55; // Low A (A1)
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.25; // Boosted base gain
      osc.connect(droneGain);
      droneGain.connect(masterGain);
      osc.start();

      // --- LAYER 3: SPIRIT CHIMES (Foreign element) ---
      const playChime = () => {
         const t = ctx.currentTime;
         const chime = ctx.createOscillator();
         const chimeGain = ctx.createGain();
         
         // Pentatonic scale frequencies (C major pentatonic approximation)
         const notes = [523.25, 659.25, 783.99, 987.77, 1174.66]; 
         const note = notes[Math.floor(Math.random() * notes.length)];
         
         chime.frequency.value = note;
         chime.type = 'triangle';

         chimeGain.gain.setValueAtTime(0, t);
         chimeGain.gain.linearRampToValueAtTime(0.08, t + 0.1); // Slightly louder
         chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 4); // Long tail

         chime.connect(chimeGain);
         chimeGain.connect(masterGain);
         chime.start(t);
         chime.stop(t + 4.1);
      };

      intervalsRef.current.push(window.setInterval(() => {
          // Occasional random chimes
          if(Math.random() > 0.7) playChime();
      }, 3500));

      // --- LAYER 4: ABSTRACT CREATURES (New) ---
      const playCreature = () => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const creatureGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // Decide between a high chirp (bird-like) or low croak (frog/mammal-like)
        const isChirp = Math.random() > 0.5;

        if (isChirp) {
            // Bird/Insect Chirp
            osc.type = 'sine';
            const startFreq = 1500 + Math.random() * 1000;
            osc.frequency.setValueAtTime(startFreq, t);
            // Quick pitch drop
            osc.frequency.exponentialRampToValueAtTime(startFreq * 0.6, t + 0.15);
            
            creatureGain.gain.setValueAtTime(0, t);
            creatureGain.gain.linearRampToValueAtTime(0.12, t + 0.02); // Louder
            creatureGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            
            osc.start(t);
            osc.stop(t + 0.4);
        } else {
            // Low Abstract Croak
            osc.type = 'triangle';
            const startFreq = 150 + Math.random() * 100;
            osc.frequency.setValueAtTime(startFreq, t);
            // Slight pitch rise then fall
            osc.frequency.linearRampToValueAtTime(startFreq * 1.2, t + 0.1);
            osc.frequency.linearRampToValueAtTime(startFreq, t + 0.3);

            creatureGain.gain.setValueAtTime(0, t);
            creatureGain.gain.linearRampToValueAtTime(0.18, t + 0.05); // Louder
            creatureGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            
            osc.start(t);
            osc.stop(t + 0.6);
        }

        // Filter to push it back into the mix (ambient feel)
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(creatureGain);
        creatureGain.connect(masterGain);
      };

      intervalsRef.current.push(window.setInterval(() => {
          // Intervally abstract animal sounds
          if(Math.random() > 0.6) playCreature();
      }, 4500));

    } else if (audioCtxRef.current) {
        // Resume/Suspend based on enabled prop
        if (enabled && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        } else if (!enabled && audioCtxRef.current.state === 'running') {
            audioCtxRef.current.suspend();
        }
    }
    
    // Smooth volume transition
    if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(enabled ? volume : 0, audioCtxRef.current.currentTime, 0.5);
    }

    return () => {
        intervalsRef.current.forEach(id => clearInterval(id));
    };
  }, [enabled, volume]);

  return null;
};
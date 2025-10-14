import { useEffect, useRef } from 'react';

// Audio context for sound effects
class BreathingAudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Master volume
      this.initialized = true;
    } catch (e) {
      console.warn('Audio context not supported:', e);
    }
  }

  // Create a bonfire crackle sound
  createBonfireCrackle() {
    if (!this.initialized) return;

    const duration = 0.3;
    const now = this.audioContext.currentTime;

    // Noise generator for crackle
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // Filter for warmth
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    // Envelope
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Create a bell toll sound
  createBellToll() {
    if (!this.initialized) return;

    const now = this.audioContext.currentTime;
    const duration = 2.0;

    // Fundamental and harmonics
    const frequencies = [220, 440, 660, 880];
    const gains = [1.0, 0.5, 0.3, 0.2];

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[index] * 0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Create a deep resonant hum
  createResonantHum() {
    if (!this.initialized) return;

    const now = this.audioContext.currentTime;
    const duration = 1.5;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 110; // Deep A

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.15, now + duration - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Add slight vibrato
    const vibrato = this.audioContext.createOscillator();
    vibrato.frequency.value = 5;
    const vibratoGain = this.audioContext.createGain();
    vibratoGain.gain.value = 3;

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.masterGain);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + duration);
    osc.stop(now + duration);
  }

  // Create a soft wind/breath sound
  createBreathSound(intensity = 0.5) {
    if (!this.initialized) return;

    const duration = 0.5;
    const now = this.audioContext.currentTime;

    // White noise
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for breath-like quality
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    // Envelope
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(intensity * 0.1, now + 0.1);
    gain.gain.linearRampToValueAtTime(intensity * 0.1, now + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Play phase transition sound
  playPhaseTransition(phase) {
    if (!this.initialized) return;

    switch (phase) {
      case 'inhale':
        this.createBreathSound(0.3);
        break;
      case 'hold':
        this.createResonantHum();
        break;
      case 'exhale':
        this.createBonfireCrackle();
        this.createBreathSound(0.5);
        break;
      case 'holdAfter':
        this.createBellToll();
        break;
      default:
        break;
    }
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// React hook for breathing audio
const useBreathingAudio = (enabled = true) => {
  const audioManagerRef = useRef(null);

  useEffect(() => {
    if (enabled && !audioManagerRef.current) {
      audioManagerRef.current = new BreathingAudioManager();
    }
  }, [enabled]);

  const initialize = async () => {
    if (audioManagerRef.current) {
      await audioManagerRef.current.initialize();
    }
  };

  const playPhaseTransition = (phase) => {
    if (enabled && audioManagerRef.current) {
      audioManagerRef.current.playPhaseTransition(phase);
    }
  };

  const setVolume = (volume) => {
    if (audioManagerRef.current) {
      audioManagerRef.current.setVolume(volume);
    }
  };

  return { initialize, playPhaseTransition, setVolume };
};

export { BreathingAudioManager, useBreathingAudio };
export default useBreathingAudio;
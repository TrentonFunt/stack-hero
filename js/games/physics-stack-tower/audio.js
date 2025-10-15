/**
 * @file audio.js
 * @game Stack Hero
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Audio system for Stack Hero. Handles sound effects and music
 * using Web Audio API with fallback to HTML5 audio.
 *
 * @dependencies
 * - game.js: Core game logic
 */

/**
 * Audio manager class for handling game sounds
 * @class
 */
class AudioManager {
  /**
   * Create a new audio manager
   * @param {Object} config - Audio configuration
   */
  constructor(config = {}) {
    this.config = {
      masterVolume: config.masterVolume || 0.7,
      sfxVolume: config.sfxVolume || 0.8,
      musicVolume: config.musicVolume || 0.5,
      ...config
    };
    
    this.sounds = new Map();
    this.isMuted = false;
    this.audioContext = null;
    
    // Initialize audio context
    this.initAudioContext();
    
    // Create sound effects
    this.createSounds();
  }

  /**
   * Initialize Web Audio API context
   */
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported, using HTML5 audio fallback');
    }
  }

  /**
   * Create all game sound effects
   */
  createSounds() {
    // Block drop sound
    this.sounds.set('blockDrop', this.createTone(200, 0.1, 'sine'));
    
    // Perfect drop sound
    this.sounds.set('perfectDrop', this.createChord([261.63, 329.63, 392.00], 0.3, 'sine'));
    
    // Block miss sound
    this.sounds.set('blockMiss', this.createTone(150, 0.5, 'sawtooth'));
    
    // Level complete sound
    this.sounds.set('levelComplete', this.createMelody([261.63, 329.63, 392.00, 523.25], 0.2));
    
    // Game over sound
    this.sounds.set('gameOver', this.createTone(100, 1.0, 'triangle'));
    
    // Tower collapse sound
    this.sounds.set('towerCollapse', this.createNoise(0.8));
    
    // Button click sound
    this.sounds.set('buttonClick', this.createTone(800, 0.1, 'square'));
    
    // Score popup sound
    this.sounds.set('scorePopup', this.createTone(600, 0.15, 'sine'));
    
    // Background music
    this.backgroundMusic = this.createBackgroundMusic();
  }

  /**
   * Create a simple tone
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} waveType - Wave type (sine, square, sawtooth, triangle)
   * @returns {Object} Sound object
   */
  createTone(frequency, duration, waveType = 'sine') {
    if (!this.audioContext) {
      return this.createHTML5Sound(frequency, duration);
    }

    return {
      play: (volume = 1) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.config.sfxVolume * this.config.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      }
    };
  }

  /**
   * Create a chord (multiple frequencies)
   * @param {Array} frequencies - Array of frequencies in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} waveType - Wave type
   * @returns {Object} Sound object
   */
  createChord(frequencies, duration, waveType = 'sine') {
    if (!this.audioContext) {
      return this.createHTML5Sound(frequencies[0], duration);
    }

    return {
      play: (volume = 1) => {
        frequencies.forEach(freq => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          oscillator.type = waveType;
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume * this.config.sfxVolume * this.config.masterVolume, this.audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration);
        });
      }
    };
  }

  /**
   * Create a melody (sequence of tones)
   * @param {Array} frequencies - Array of frequencies in Hz
   * @param {number} noteDuration - Duration of each note in seconds
   * @returns {Object} Sound object
   */
  createMelody(frequencies, noteDuration) {
    if (!this.audioContext) {
      return this.createHTML5Sound(frequencies[0], noteDuration * frequencies.length);
    }

    return {
      play: (volume = 1) => {
        frequencies.forEach((freq, index) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * noteDuration);
          oscillator.type = 'sine';
          
          const startTime = this.audioContext.currentTime + index * noteDuration;
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume * this.config.sfxVolume * this.config.masterVolume, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + noteDuration);
        });
      }
    };
  }

  /**
   * Create noise sound
   * @param {number} duration - Duration in seconds
   * @returns {Object} Sound object
   */
  createNoise(duration) {
    if (!this.audioContext) {
      return this.createHTML5Sound(200, duration);
    }

    return {
      play: (volume = 1) => {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(volume * this.config.sfxVolume * this.config.masterVolume * 0.1, this.audioContext.currentTime);
        
        source.start(this.audioContext.currentTime);
      }
    };
  }

  /**
   * Create ambient background music
   * @returns {Object} Background music object
   */
  createBackgroundMusic() {
    if (!this.audioContext) {
      return { play: () => {}, stop: () => {}, isPlaying: false };
    }

    const duration = 20; // 20 seconds loop
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    // Create left and right channels
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Ambient pad sound
    for (let i = 0; i < leftChannel.length; i++) {
      const t = i / sampleRate;
      
      // Base frequency with slow modulation
      const baseFreq = 55; // Low A
      const modulation = Math.sin(t * 0.1) * 2;
      const frequency = baseFreq + modulation;
      
      // Create rich harmonic content
      let sample = 0;
      sample += Math.sin(2 * Math.PI * frequency * t) * 0.1;
      sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.05;
      sample += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.03;
      
      // Apply slow envelope
      const envelope = 0.2 + 0.1 * Math.sin(t * 0.05);
      
      // Add slight stereo spread
      leftChannel[i] = sample * envelope;
      rightChannel[i] = sample * envelope * 0.8;
    }
    
    return {
      buffer: buffer,
      duration: duration,
      source: null,
      isPlaying: false,
      play: () => {
        if (this.backgroundMusic.isPlaying) return;
        
        this.backgroundMusic.source = this.audioContext.createBufferSource();
        this.backgroundMusic.source.buffer = this.backgroundMusic.buffer;
        this.backgroundMusic.source.loop = true;
        
        const gainNode = this.audioContext.createGain();
        this.backgroundMusic.source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          this.config.musicVolume * this.config.masterVolume * 0.1, 
          this.audioContext.currentTime + 2
        );
        
        this.backgroundMusic.source.start();
        this.backgroundMusic.isPlaying = true;
      },
      stop: () => {
        if (this.backgroundMusic.source) {
          this.backgroundMusic.source.stop();
          this.backgroundMusic.source = null;
          this.backgroundMusic.isPlaying = false;
        }
      }
    };
  }

  /**
   * Create HTML5 audio fallback
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @returns {Object} Sound object
   */
  createHTML5Sound(frequency, duration) {
    return {
      play: (volume = 1) => {
        // Simple beep using HTML5 audio
        const audio = new Audio();
        audio.volume = volume * this.config.sfxVolume * this.config.masterVolume;
        
        // Create a data URL for a simple beep
        const sampleRate = 44100;
        const numSamples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, numSamples * 2, true);
        
        // Generate sine wave
        for (let i = 0; i < numSamples; i++) {
          const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
          view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        audio.src = URL.createObjectURL(blob);
        audio.play();
      }
    };
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   * @param {number} volume - Volume multiplier (0-1)
   */
  playSound(soundName, volume = 1) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        sound.play(volume);
      } catch (error) {
        console.warn(`Failed to play sound: ${soundName}`, error);
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Start background music
   */
  startBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setMasterVolume(volume) {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set SFX volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Resume audio context (required for user interaction)
   */
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Global audio manager instance
let audioManager = null;

/**
 * Initialize the audio manager
 * @param {Object} config - Audio configuration
 * @returns {AudioManager} Initialized audio manager
 */
function initAudioManager(config = {}) {
  audioManager = new AudioManager(config);
  return audioManager;
}

/**
 * Get the current audio manager instance
 * @returns {AudioManager} Current audio manager
 */
function getAudioManager() {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AudioManager,
    initAudioManager,
    getAudioManager
  };
} else {
  window.AudioManager = AudioManager;
  window.initAudioManager = initAudioManager;
  window.getAudioManager = getAudioManager;
}

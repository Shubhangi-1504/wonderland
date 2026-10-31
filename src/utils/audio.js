// Web Audio API Synthesizer & Procedural Ambient Music Engine
// 100% offline, zero external audio assets, zero copyright issues, comfortable volume

const STORAGE_KEYS = {
  SOUND_ENABLED: 'investquest_sound_enabled',
  MUSIC_ENABLED: 'investquest_music_enabled',
  MUSIC_VOLUME: 'investquest_music_volume',
};

class SoundManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false; // Off by default to respect autoplay, easy 1-click enable
    this.musicVolume = 0.25;

    // Music engine internal state
    this.bgmTimer = null;
    this.bgmGainNode = null;
    this.currentChordIndex = 0;
    this.isPlayingMusic = false;

    // Load persisted settings safely
    if (typeof window !== 'undefined') {
      try {
        const soundPref = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
        if (soundPref !== null) this.soundEnabled = soundPref === 'true';

        const musicPref = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED);
        if (musicPref !== null) this.musicEnabled = musicPref === 'true';

        const volPref = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
        if (volPref !== null) this.musicVolume = parseFloat(volPref);
      } catch {
        // Storage fallback
      }
    }
  }

  get enabled() {
    return this.soundEnabled;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // SOUND EFFECTS
  // --------------------------------------------------------------------------
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  playClick() {
    this.playTone(880, 'sine', 0.08, 0.06);
  }

  playHover() {
    this.playTone(440, 'sine', 0.04, 0.02);
  }

  playBuildingSelect() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [329.63, 440.0, 659.25].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    } catch {}
  }

  playMissionStart() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.06, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.4);
      });
    } catch {}
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // High bright major triad (C5 -> E5 -> G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch {}
  }

  playIncorrect() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Soft low descent buzz
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.22);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  playXPReward() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [659.25, 783.99, 987.77, 1318.51].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    } catch {}
  }

  playSuccess() {
    this.playXPReward();
  }

  playLevelUp() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Triumphant Fanfare Arpeggio
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i > 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.07, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.5);
      });
    } catch {}
  }

  playBadgeUnlock() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Shimmering Golden Chime
      const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.55);
      });
    } catch {}
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.soundEnabled.toString());
    } catch {}
    return this.soundEnabled;
  }

  setSoundEnabled(val) {
    this.soundEnabled = !!val;
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.soundEnabled.toString());
    } catch {}
  }

  // --------------------------------------------------------------------------
  // PROCEDURAL AMBIENT BACKGROUND MUSIC ENGINE
  // --------------------------------------------------------------------------
  startMusic() {
    this.init();
    if (!this.ctx || this.isPlayingMusic) return;

    this.isPlayingMusic = true;
    this.playNextAmbientChord();

    // Schedule chords every 4.8 seconds
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    this.bgmTimer = setInterval(() => {
      if (this.musicEnabled && this.isPlayingMusic) {
        this.playNextAmbientChord();
      }
    }, 4800);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, this.musicEnabled.toString());
    } catch {}

    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  setMusicEnabled(val) {
    this.musicEnabled = !!val;
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, this.musicEnabled.toString());
    } catch {}

    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, this.musicVolume.toString());
    } catch {}
  }

  // Lush, relaxing chord progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
  playNextAmbientChord() {
    if (!this.musicEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const chords = [
        [130.81, 196.0, 246.94, 293.66, 329.63], // C3, G3, B3, D4, E4 (Cmaj9)
        [110.0, 164.81, 220.0, 261.63, 329.63],  // A2, E3, A3, C4, E4 (Am9)
        [87.31, 174.61, 220.0, 261.63, 329.63],  // F2, F3, A3, C4, E4 (Fmaj7)
        [98.0, 146.83, 196.0, 261.63, 293.66],   // G2, D3, G3, C4, D4 (Gsus4)
      ];

      const chord = chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      const now = this.ctx.currentTime;
      const duration = 4.6;
      const chordGain = this.ctx.createGain();

      // Master BGM gain
      const effectiveGain = this.musicVolume * 0.05;
      chordGain.gain.setValueAtTime(0.0001, now);
      chordGain.gain.linearRampToValueAtTime(effectiveGain, now + 1.2);
      chordGain.gain.setValueAtTime(effectiveGain, now + 3.2);
      chordGain.gain.linearRampToValueAtTime(0.0001, now + duration);

      // Lowpass warmth filter to remove harshness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, now);
      filter.frequency.linearRampToValueAtTime(840, now + 2.0);
      filter.frequency.linearRampToValueAtTime(620, now + duration);

      chordGain.connect(filter);
      filter.connect(this.ctx.destination);

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        // Subtle vibrato/detune for warm analog feel
        osc.detune.setValueAtTime((idx - 2) * 3, now);

        osc.connect(chordGain);
        osc.start(now);
        osc.stop(now + duration);
      });

      // Occasional gentle bell ping (high pentatonic note)
      if (Math.random() > 0.3) {
        const bellNotes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        const bellFreq = bellNotes[Math.floor(Math.random() * bellNotes.length)];
        const bellNow = now + 1.2 + Math.random() * 1.5;

        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, bellNow);

        const bellVol = this.musicVolume * 0.025;
        bellGain.gain.setValueAtTime(bellVol, bellNow);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, bellNow + 1.8);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);

        bellOsc.start(bellNow);
        bellOsc.stop(bellNow + 2.0);
      }
    } catch {
      // Audio fallback
    }
  }
}

export const soundFX = new SoundManager();

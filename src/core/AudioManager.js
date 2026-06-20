export class AudioManager {
  constructor() {
    this.context = null;
    this.musicVolume = 0.45;
    this.sfxVolume = 0.7;
    this.musicNodes = null;
  }

  ensureContext() {
    this.context ||= new (window.AudioContext || window.webkitAudioContext)();
    return this.context;
  }

  setVolumes({ musicVolume = this.musicVolume, sfxVolume = this.sfxVolume } = {}) {
    this.musicVolume = musicVolume;
    this.sfxVolume = sfxVolume;
    if (this.musicNodes) {
      this.musicNodes.gain.gain.value = this.musicVolume * 0.025;
    }
  }

  playSfx(type) {
    if (!this.sfxVolume) return;
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const tones = {
      plant: 420,
      water: 560,
      harvest: 720,
      mine: 160,
      chop: 220,
      button: 500,
      fish: 520,
      quest: 880,
      hit: 220
    };
    oscillator.frequency.value = tones[type] || 440;
    oscillator.type = type === "mine" || type === "hit" || type === "chop" ? "square" : "sine";
    gain.gain.value = this.sfxVolume * 0.08;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.stop(context.currentTime + 0.18);
  }

  startSeasonMusic(season) {
    if (this.musicNodes || !this.musicVolume) return;
    const context = this.ensureContext();
    const baseTone = {
      Spring: 261.63,
      Summer: 329.63,
      Fall: 220,
      Winter: 196
    }[season] || 261.63;
    const gain = context.createGain();
    const oscA = context.createOscillator();
    const oscB = context.createOscillator();
    oscA.type = "sine";
    oscB.type = "triangle";
    oscA.frequency.value = baseTone;
    oscB.frequency.value = baseTone * 1.5;
    gain.gain.value = this.musicVolume * 0.025;
    oscA.connect(gain);
    oscB.connect(gain);
    gain.connect(context.destination);
    oscA.start();
    oscB.start();
    this.musicNodes = { oscA, oscB, gain };
  }
}

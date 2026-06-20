export class Game {
  constructor({ renderer, input, saveManager }) {
    this.renderer = renderer;
    this.input = input;
    this.saveManager = saveManager;
    this.running = false;
  }

  start(loop) {
    this.running = true;
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}

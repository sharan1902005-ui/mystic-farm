export class DebugConsole {
  constructor(getState) {
    this.getState = getState;
    this.visible = false;
    this.element = document.createElement("aside");
    this.element.className = "developer-panel";
    document.body.appendChild(this.element);
    this.render();
  }

  toggle() {
    this.visible = !this.visible;
    this.render();
  }

  render() {
    this.element.classList.toggle("visible", this.visible);

    if (!this.visible) {
      this.element.innerHTML = "";
      return;
    }

    const { fps, player, game } = this.getState();
    this.element.innerHTML = `
      <h2>Developer Panel</h2>
      <div>FPS: ${fps}</div>
      <div>Player Tile: ${Math.floor(player.x / 48)}, ${Math.floor(player.y / 48)}</div>
      <div>Player Pixel: ${Math.round(player.x)}, ${Math.round(player.y)}</div>
      <div>Gold: ${game.gold}</div>
      <div>Energy: ${player.energy}</div>
      <div>Weather: ${game.weather}</div>
      <div>Season: ${game.season}</div>
      <div>Map: ${game.currentMap}</div>
    `;
  }
}

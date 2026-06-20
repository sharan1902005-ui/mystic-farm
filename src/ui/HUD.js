export class HUD {
  constructor(root = document) {
    this.root = root;
  }

  setText(id, value) {
    const element = this.root.getElementById(id);
    if (element) element.textContent = value;
  }
}

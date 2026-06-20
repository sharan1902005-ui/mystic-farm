export class AssetManager {
  constructor() {
    this.assets = new Map();
    this.failed = new Set();
  }

  loadImage(id, src) {
    if (this.assets.has(id)) return this.assets.get(id);

    const image = new Image();
    image.onerror = () => this.failed.add(id);
    image.src = src;
    this.assets.set(id, image);
    return image;
  }

  get(id) {
    return this.assets.get(id) || null;
  }

  hasFailed(id) {
    return this.failed.has(id);
  }
}

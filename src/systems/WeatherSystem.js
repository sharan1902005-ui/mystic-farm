export class WeatherSystem {
  constructor(types = ["Sunny", "Rainy", "Windy"]) {
    this.types = types;
  }

  roll(random = Math.random()) {
    if (random < 0.7) return "Sunny";
    if (random < 0.9) return "Rainy";
    return "Windy";
  }
}

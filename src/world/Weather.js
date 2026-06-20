export function rollWeather(random = Math.random) {
  const roll = random();

  if (roll < 0.7) return "Sunny";
  if (roll < 0.9) return "Rainy";
  return "Windy";
}

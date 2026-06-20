const DIRECTIONS = [
    { x: 0, y: -1, direction: "up" },
    { x: 0, y: 1, direction: "down" },
    { x: -1, y: 0, direction: "left" },
    { x: 1, y: 0, direction: "right" }
];

export class AnimalAI {
    chooseBehavior(animal, { isNight }) {
        if (isNight) {
            return {
                state: "sleep",
                timer: this.random(1600, 3000),
                step: null
            };
        }

        const roll = Math.random();
        if (roll < 0.22) {
            return { state: "idle", timer: this.random(650, 1500), step: null };
        }

        if (roll < 0.5) {
            return { state: "eat", timer: this.random(900, 2100), step: null };
        }

        const step = DIRECTIONS[this.random(0, DIRECTIONS.length - 1)];
        animal.direction = step.direction;
        return {
            state: "walk",
            timer: this.random(520, 1250),
            step
        };
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

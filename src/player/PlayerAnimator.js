export class PlayerAnimator {
    constructor(frameDuration = 120) {
        this.frameDuration = frameDuration;
        this.elapsed = 0;
        this.frame = 0;
        this.state = "idle";
        this.direction = "down";
    }

    update(dt, player) {
        this.direction = player.direction || this.direction;
        const nextState = player.usingTool ? "tool" : player.moving ? "walk" : "idle";

        if (nextState !== this.state) {
            this.state = nextState;
            this.elapsed = 0;
            this.frame = 0;
        }

        const duration = this.state === "tool" ? 55 : this.frameDuration;
        this.elapsed += dt;

        if (this.elapsed >= duration) {
            this.elapsed = 0;
            this.frame = this.state === "idle"
                ? (this.frame + 1) % 2
                : (this.frame + 1) % 4;
        }
    }

    getFrame() {
        return {
            state: this.state,
            direction: this.direction,
            frame: this.frame
        };
    }
}

export class Mannequin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 100;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.5;
        this.grounded = false;

        // Body proportions
        this.headRadius = 15;
        this.torsoWidth = 20;
        this.torsoHeight = 50;

        // Health
        this.maxHealth = 5;
        this.health = 5;
    }

    update(input, canvasHeight, obstacles) {
        // Horizontal Movement
        if (input.right) this.vx = this.speed;
        else if (input.left) this.vx = -this.speed;
        else this.vx = 0;

        // Apply Horizontal Velocity
        this.x += this.vx;

        // Horizontal Collision Check
        for (let obs of obstacles) {
            if (this.checkCollision(this, obs)) {
                if (this.vx > 0) { // Moving Right
                    this.x = obs.x - this.width;
                } else if (this.vx < 0) { // Moving Left
                    this.x = obs.x + obs.width;
                }
            }
        }

        // Jump
        if (input.jump && this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
        }

        // Apply Gravity
        this.vy += this.gravity;

        // Apply Vertical Velocity
        this.y += this.vy;

        this.grounded = false; // Assume in air until collision proves otherwise

        // Vertical Collision Check (Obstacles)
        for (let obs of obstacles) {
            if (this.checkCollision(this, obs)) {
                if (this.vy > 0) { // Falling down
                    this.y = obs.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                } else if (this.vy < 0) { // Jumping up (hitting ceiling? - usually rare for rocks)
                    this.y = obs.y + obs.height;
                    this.vy = 0;
                }
            }
        }

        // Floor Collision
        const floorY = canvasHeight - 50;
        if (this.y + this.height > floorY) {
            this.y = floorY - this.height;
            this.vy = 0;
            this.grounded = true;
        }
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    draw(ctx) {
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;

        const centerX = this.x + this.width / 2;

        // 1. Head
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Torso
        const torsoY = this.y + this.headRadius * 2;
        ctx.fillRect(centerX - this.torsoWidth / 2, torsoY, this.torsoWidth, this.torsoHeight);

        // 3. Arms (Simple Lines for now)
        ctx.beginPath();
        // Left Arm
        ctx.moveTo(centerX - this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX - this.torsoWidth / 2 - 15, torsoY + 30);
        // Right Arm
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX + this.torsoWidth / 2 + 15, torsoY + 30);
        ctx.stroke();

        // 4. Legs
        const legStartY = torsoY + this.torsoHeight;
        ctx.beginPath();
        // Left Leg
        ctx.moveTo(centerX - 5, legStartY);
        ctx.lineTo(centerX - 10, legStartY + 30);
        // Right Leg
        ctx.moveTo(centerX + 5, legStartY);
        ctx.lineTo(centerX + 10, legStartY + 30);
        ctx.stroke();
    }
}

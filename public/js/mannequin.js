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
    }

    update(input, canvasHeight) {
        // Horizontal Movement
        if (input.right) this.vx = this.speed;
        else if (input.left) this.vx = -this.speed;
        else this.vx = 0;

        // Jump
        if (input.jump && this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
        }

        // Apply Physics
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        // Floor Collision (Simple Plains)
        // Let's assume the floor is 50px from the bottom
        const floorY = canvasHeight - 50;

        if (this.y + this.height > floorY) {
            this.y = floorY - this.height;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
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

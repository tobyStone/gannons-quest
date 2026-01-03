export class Mannequin {
    constructor(x, y, color = '#333') {
        this.x = x;
        this.y = y;
        this.color = color;
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

        // Mist Ability
        this.mistTimer = 0;
        this.cooldownTimer = 0;
    }

    triggerMist() {
        if (this.cooldownTimer <= 0 && this.mistTimer <= 0) {
            this.mistTimer = 60; // 60 frames ~ 1 second
        }
    }

    update(input, canvasHeight, obstacles) {
        // Mist Timer & Cooldown
        if (this.mistTimer > 0) {
            this.mistTimer--;
            if (this.mistTimer === 0) {
                this.cooldownTimer = 60; // Set cooldown when mist ends
            }
        }

        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
        }

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
        // Draw Mist
        if (this.mistTimer > 0) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#800080'; // Purple
            ctx.beginPath();
            ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.color === '#333') {
            this.drawGannon(ctx);
        } else {
            this.drawDefault(ctx);
        }
    }

    drawDefault(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;

        const centerX = this.x + this.width / 2;

        // 1. Head
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Torso
        const torsoY = this.y + this.headRadius * 2;
        ctx.fillRect(centerX - this.torsoWidth / 2, torsoY, this.torsoWidth, this.torsoHeight);

        // 3. Arms
        ctx.beginPath();
        ctx.moveTo(centerX - this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX - this.torsoWidth / 2 - 15, torsoY + 30);
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX + this.torsoWidth / 2 + 15, torsoY + 30);
        ctx.stroke();

        // 4. Legs
        const legStartY = torsoY + this.torsoHeight;
        ctx.beginPath();
        ctx.moveTo(centerX - 5, legStartY);
        ctx.lineTo(centerX - 10, legStartY + 30);
        ctx.moveTo(centerX + 5, legStartY);
        ctx.lineTo(centerX + 10, legStartY + 30);
        ctx.stroke();
    }

    drawGannon(ctx) {
        const centerX = this.x + this.width / 2;

        // 1. Head (Dark Olive Skin)
        ctx.fillStyle = '#556B2F';
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Hair (Crimson Red)
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius - 5, this.headRadius + 2, Math.PI, 0); // Top half arc
        ctx.fill();

        // 3. Torso (Dark Armor)
        const torsoY = this.y + this.headRadius * 2;
        ctx.fillStyle = '#2F4F4F'; // Dark Slate Grey
        ctx.fillRect(centerX - this.torsoWidth / 2, torsoY, this.torsoWidth, this.torsoHeight);

        // Gold Details on Chest
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(centerX, torsoY + 15, 5, 0, Math.PI * 2); // Amulet
        ctx.fill();

        // 4. Arms (Dark Skin + Armor)
        ctx.strokeStyle = '#556B2F'; // Skin color arms
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX - this.torsoWidth / 2 - 15, torsoY + 30);
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX + this.torsoWidth / 2 + 15, torsoY + 30);
        ctx.stroke();

        // Shoulder Pads (Gold)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(centerX - this.torsoWidth / 2 - 5, torsoY, 5, 10); // Left
        ctx.fillRect(centerX + this.torsoWidth / 2, torsoY, 5, 10); // Right

        // 5. Legs (Boots)
        const legStartY = torsoY + this.torsoHeight;
        ctx.strokeStyle = '#8B4513'; // Brown Boots
        ctx.beginPath();
        ctx.moveTo(centerX - 5, legStartY);
        ctx.lineTo(centerX - 10, legStartY + 30);
        ctx.moveTo(centerX + 5, legStartY);
        ctx.lineTo(centerX + 10, legStartY + 30);
        ctx.stroke();
    }
}

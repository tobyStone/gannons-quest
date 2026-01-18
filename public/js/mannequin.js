export class Mannequin {
    constructor(x, y, color = '#333') {
        this.x = x;
        this.y = y;
        if (typeof color === 'string') {
            this.color = color;
            this.image = null;
        } else {
            this.color = null;
            this.image = color;
        }
        this.width = 40;
        this.height = 100;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        // Gravity removed for top-down
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

        // Projectile Ability
        this.fireTimer = 0;
        this.fireCooldown = 120; // Fire every ~2 seconds

        // Item Holding
        this.isHolding = false;
    }

    triggerMist() {
        if (this.cooldownTimer <= 0 && this.mistTimer <= 0) {
            this.mistTimer = 60; // 60 frames ~ 1 second
        }
    }

    update(input, canvasHeight, obstacles, canvasWidth) {
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

        // Vertical Movement (Top-Down)
        if (input.down) this.vy = this.speed;
        else if (input.up) this.vy = -this.speed;
        else this.vy = 0;

        // Apply Velocity
        this.x += this.vx;
        this.y += this.vy;

        // Screen Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvasHeight) this.y = canvasHeight - this.height;

        // Collision Check (Simple stop on collision)
        for (let obs of obstacles) {
            if (this.checkCollision(this, obs)) {
                // Determine overlap and push back
                // This is a simple way: revert position on collision axis
                // But since we moved both, we need to know which one caused it.
                // For simplicity in this step, let's revert both? No, that feels sticky.
                // Let's check X and Y separately in a real physics engine, but for now:

                // Revert X if X caused it?
                // A better approach for top down without complex physics:
                // Move X, check collision, if hit, revert X.
                // Move Y, check collision, if hit, revert Y.
            }
        }

        // Revised Movement with separate collision checks
        // Undo the previous addition, let's do it properly step-by-step
        this.x -= this.vx;
        this.y -= this.vy; // Reset to start of frame

        // 1. Move X
        this.x += this.vx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        for (let obs of obstacles) {
            if (this.checkCollision(this, obs)) {
                if (this.vx > 0) this.x = obs.x - this.width;
                else if (this.vx < 0) this.x = obs.x + obs.width;
            }
        }

        // 2. Move Y
        this.y += this.vy;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvasHeight) this.y = canvasHeight - this.height;

        for (let obs of obstacles) {
            if (this.checkCollision(this, obs)) {
                if (this.vy > 0) this.y = obs.y - this.height;
                else if (this.vy < 0) this.y = obs.y + obs.height;
            }
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

        if (this.isHolding) {
            this.drawHolding(ctx);
        } else if (this.color === '#333') {
            this.drawGannon(ctx);
        } else if (this.image) {
            ctx.drawImage(this.image, this.x - 20, this.y - 20, this.width + 40, this.height + 40); // Draw slightly larger to fit bounding box visual
        } else {
            this.drawDefault(ctx);
        }
    }

    drawHolding(ctx) {
        // Draw character with arms up
        // Reuse default drawing style but modify arms

        // 1. Head
        const centerX = this.x + this.width / 2;
        const headGrad = ctx.createRadialGradient(
            centerX - 5, this.y + this.headRadius - 5, 2,
            centerX, this.y + this.headRadius, this.headRadius
        );
        headGrad.addColorStop(0, '#666');
        headGrad.addColorStop(1, this.color || '#333');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Torso
        const torsoY = this.y + this.headRadius * 2;
        const torsoGrad = ctx.createLinearGradient(centerX - this.torsoWidth / 2, torsoY, centerX + this.torsoWidth / 2, torsoY);
        torsoGrad.addColorStop(0, this.color || '#333');
        torsoGrad.addColorStop(1, '#222');
        ctx.fillStyle = torsoGrad;
        ctx.fillRect(centerX - this.torsoWidth / 2, torsoY, this.torsoWidth, this.torsoHeight);

        // 3. Arms (UP)
        ctx.strokeStyle = this.color || '#333';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Left Arm Up
        ctx.moveTo(centerX - this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX - this.torsoWidth / 2 - 10, torsoY - 20);
        // Right Arm Up
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX + this.torsoWidth / 2 + 10, torsoY - 20);
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

    drawDefault(ctx) {
        // Pseudo-3D Mannequin
        const centerX = this.x + this.width / 2;
        const depth = 10;

        // 1. Head (Sphere with Gradient)
        const headGrad = ctx.createRadialGradient(
            centerX - 5, this.y + this.headRadius - 5, 2,
            centerX, this.y + this.headRadius, this.headRadius
        );
        headGrad.addColorStop(0, '#666'); // Highlight
        headGrad.addColorStop(1, this.color); // Base color

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Torso (3D Box)
        const torsoY = this.y + this.headRadius * 2;

        // Torso Side (Shadow)
        ctx.fillStyle = '#1a1a1a'; // Darker side
        ctx.beginPath();
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY);
        ctx.lineTo(centerX + this.torsoWidth / 2 + depth / 2, torsoY - depth / 2);
        ctx.lineTo(centerX + this.torsoWidth / 2 + depth / 2, torsoY + this.torsoHeight - depth / 2);
        ctx.lineTo(centerX + this.torsoWidth / 2, torsoY + this.torsoHeight);
        ctx.fill();

        // Torso Front
        const torsoGrad = ctx.createLinearGradient(centerX - this.torsoWidth / 2, torsoY, centerX + this.torsoWidth / 2, torsoY);
        torsoGrad.addColorStop(0, this.color);
        torsoGrad.addColorStop(1, '#222'); // Gradient for roundness
        ctx.fillStyle = torsoGrad;
        ctx.fillRect(centerX - this.torsoWidth / 2, torsoY, this.torsoWidth, this.torsoHeight);

        // 3. Arms (Rounded strokes)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX - this.torsoWidth / 2 - 15, torsoY + 30);
        ctx.moveTo(centerX + this.torsoWidth / 2, torsoY + 5);
        ctx.lineTo(centerX + this.torsoWidth / 2 + 15, torsoY + 30);
        ctx.stroke();

        // 4. Legs (Rounded strokes)
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

    canFire() {
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireCooldown;
            return true;
        }
        return false;
    }

    updateFireTimer() {
        if (this.fireTimer > 0) {
            this.fireTimer--;
        }
    }
}

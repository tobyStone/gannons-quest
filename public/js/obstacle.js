export class Obstacle {
    constructor(x, y, width, height, type = 'rock') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx) {
        if (this.type === 'rock') {
            const depth = 20;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 1.5, depth / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Right Face (Darker)
            ctx.fillStyle = '#505050';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width + depth, this.y - depth);
            ctx.lineTo(this.x + this.width + depth, this.y + this.height - depth);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.fill();

            // Top Face (Lighter)
            ctx.fillStyle = '#A0A0A0';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + depth, this.y - depth);
            ctx.lineTo(this.x + this.width + depth, this.y - depth);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.fill();

            // Front Face
            ctx.fillStyle = '#808080'; // Grey rock
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Detail lines
            ctx.strokeStyle = '#606060';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

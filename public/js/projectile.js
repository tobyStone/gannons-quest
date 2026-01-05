export class Projectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 10;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00FFFF'; // Cyan center
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0000FF'; // Blue glow
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

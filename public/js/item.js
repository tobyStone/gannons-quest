export class Heart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
    }

    draw(ctx) {
        // Floating animation
        this.floatOffset = Math.sin(Date.now() * 0.005) * 5;

        const centerY = this.y + this.floatOffset;

        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        const topCurveHeight = this.height * 0.3;
        ctx.moveTo(this.x, centerY + topCurveHeight);
        // Top left curve
        ctx.bezierCurveTo(
            this.x, centerY,
            this.x - this.width / 2, centerY,
            this.x - this.width / 2, centerY + topCurveHeight
        );
        // Bottom tip
        ctx.bezierCurveTo(
            this.x - this.width / 2, centerY + (this.height + topCurveHeight) / 2,
            this.x, centerY + (this.height + topCurveHeight) / 2,
            this.x, centerY + this.height
        );
        // Top right curve
        ctx.bezierCurveTo(
            this.x, centerY + (this.height + topCurveHeight) / 2,
            this.x + this.width / 2, centerY + (this.height + topCurveHeight) / 2,
            this.x + this.width / 2, centerY + topCurveHeight
        );
        ctx.bezierCurveTo(
            this.x + this.width / 2, centerY,
            this.x, centerY,
            this.x, centerY + topCurveHeight
        );
        ctx.fill();

        // Shine/Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - 5, centerY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

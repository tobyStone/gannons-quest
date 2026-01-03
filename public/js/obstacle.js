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
            ctx.fillStyle = '#808080'; // Grey rock
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Add a little detail (border/shadow)
            ctx.strokeStyle = '#505050';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

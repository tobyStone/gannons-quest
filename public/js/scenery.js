export class Tree {
    constructor(x, floorY) {
        this.x = x;
        this.floorY = floorY;
        this.trunkWidth = 20 + Math.random() * 10;
        this.trunkHeight = 60 + Math.random() * 60;
        this.foliageSize = 40 + Math.random() * 20;
    }

    draw(ctx) {
        // Trunk
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ctx.fillRect(this.x, this.floorY - this.trunkHeight, this.trunkWidth, this.trunkHeight);

        // Foliage
        ctx.fillStyle = '#228B22'; // ForestGreen
        ctx.beginPath();
        const centerX = this.x + this.trunkWidth / 2;
        const centerY = this.floorY - this.trunkHeight;
        ctx.arc(centerX, centerY, this.foliageSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30 + Math.random() * 20;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.8, this.y - this.size * 0.5, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 1.6, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

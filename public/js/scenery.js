export class BackgroundLayer {
    constructor(imageSrc, speed, y) {
        this.x = 0;
        this.y = y;
        this.speed = speed;
        this.loaded = false;
        // If imageSrc is a color string, treat as static color layer (e.g., mountains)
        if (imageSrc.startsWith('#')) {
            this.color = imageSrc;
            this.isColor = true;
        } else {
            this.image = new Image();
            this.image.src = imageSrc;
            this.image.onload = () => { this.loaded = true; };
            this.isColor = false;
        }
    }

    update(playerSpeed) {
        this.x -= this.speed + (playerSpeed * 0.1); // Parallax factor
        if (this.x <= -window.innerWidth) {
            this.x = 0;
        }
    }

    draw(ctx, canvasWidth, canvasHeight) {
        if (this.isColor) {
            // Draw generated mountains/hills
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, canvasHeight);
            // Simple hill generation
            for (let i = 0; i <= canvasWidth + 100; i += 50) {
                const h = 100 + Math.sin((this.x + i) * 0.01) * 50;
                ctx.lineTo(this.x + i, canvasHeight - this.y - h);
            }
            ctx.lineTo(this.x + canvasWidth + 100, canvasHeight);
            ctx.lineTo(this.x, canvasHeight);
            ctx.fill();

            // Draw second copy for loop
            ctx.beginPath();
            ctx.moveTo(this.x + canvasWidth, canvasHeight);
            for (let i = 0; i <= canvasWidth + 100; i += 50) {
                const h = 100 + Math.sin((this.x + i) * 0.01) * 50;
                ctx.lineTo(this.x + canvasWidth + i, canvasHeight - this.y - h);
            }
            ctx.lineTo(this.x + canvasWidth * 2 + 100, canvasHeight);
            ctx.lineTo(this.x + canvasWidth, canvasHeight);
            ctx.fill();

        } else if (this.loaded) {
            // Draw Image
            ctx.drawImage(this.image, this.x, this.y, canvasWidth, canvasHeight);
            ctx.drawImage(this.image, this.x + canvasWidth, this.y, canvasWidth, canvasHeight);
        }
    }
}

export class Tree {
    constructor(x, floorY) {
        this.x = x;
        this.floorY = floorY;
        this.trunkWidth = 20 + Math.random() * 10;
        this.trunkHeight = 60 + Math.random() * 60;
        this.foliageSize = 40 + Math.random() * 20;
    }

    draw(ctx) {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.trunkWidth / 2, this.floorY, this.trunkWidth, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk (Gradient)
        const trunkGrad = ctx.createLinearGradient(this.x, this.floorY - this.trunkHeight, this.x + this.trunkWidth, this.floorY);
        trunkGrad.addColorStop(0, '#8B4513');
        trunkGrad.addColorStop(1, '#5D2906');
        ctx.fillStyle = trunkGrad;
        ctx.fillRect(this.x, this.floorY - this.trunkHeight, this.trunkWidth, this.trunkHeight);

        // Foliage (Gradient)
        const leafGrad = ctx.createRadialGradient(
            this.x + this.trunkWidth / 2 - 10, this.floorY - this.trunkHeight - 10, 5,
            this.x + this.trunkWidth / 2, this.floorY - this.trunkHeight, this.foliageSize
        );
        leafGrad.addColorStop(0, '#32CD32');
        leafGrad.addColorStop(1, '#006400');

        ctx.fillStyle = leafGrad;
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
        // Gradient Cloud
        const cloudGrad = ctx.createRadialGradient(
            this.x, this.y - 10, this.size * 0.2,
            this.x, this.y, this.size
        );
        cloudGrad.addColorStop(0, '#FFFFFF');
        cloudGrad.addColorStop(1, '#E0E0E0');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.8, this.y - this.size * 0.5, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 1.6, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

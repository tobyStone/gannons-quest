import { Mannequin } from './mannequin.js';
import { Obstacle } from './obstacle.js';
import { Tree, Cloud, BackgroundLayer } from './scenery.js';
import { Projectile } from './projectile.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const revivalBtn = document.getElementById('revivalBtn');

let mannequin;
let enemy;
let obstacles = [];
let trees = [];
let clouds = [];
let projectiles = [];
let backgroundLayers = [];

const input = {
    left: false,
    right: false,
    jump: false
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init() {
    resize();
    window.addEventListener('resize', resize);

    // Init Parallax Backgrounds
    backgroundLayers = [
        new BackgroundLayer('#A2D9F7', 0, 0), // Sky Color (Base)
        new BackgroundLayer('#C0E6FA', 0.2, 200), // Distant Mountains/Hills Color
        new BackgroundLayer('#87CEEB', 0.5, 100)  // Closer Hills
    ];


    // Spawn mannequin in center
    mannequin = new Mannequin(100, canvas.height / 2); // Start on left

    // Spawn Enemy (Red) on Right
    const enemyImage = new Image();
    enemyImage.src = 'images/enemy_monk.png';
    enemy = new Mannequin(canvas.width - 200, canvas.height / 2, enemyImage);

    // Spawn Obstacles (Rocks)
    obstacles = [
        new Obstacle(400, canvas.height - 150, 100, 100),   // Big Rock
        new Obstacle(700, canvas.height - 100, 60, 50),     // Small Step
        new Obstacle(850, canvas.height - 170, 80, 120),    // Tall Pillar
    ];

    // Spawn Scenery
    const floorY = canvas.height - 50;
    // Trees
    for (let i = 0; i < 8; i++) {
        trees.push(new Tree(Math.random() * canvas.width, floorY));
    }
    // Clouds
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud(Math.random() * canvas.width, 50 + Math.random() * 100));
    }

    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowRight') input.right = true;
        if (e.code === 'ArrowLeft') input.left = true;
        if (e.code === 'Space') input.jump = true;

        if (e.code === 'KeyA') mannequin.triggerMist();
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowRight') input.right = false;
        if (e.code === 'ArrowLeft') input.left = false;
        if (e.code === 'Space') input.jump = false;
    });

    // Revival Button Listener
    revivalBtn.addEventListener('click', () => {
        resetGame();
    });

    // Start Loop
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    // Reset Mannequin
    mannequin.health = mannequin.maxHealth;
    mannequin.x = 100;
    mannequin.y = canvas.height / 2;
    mannequin.vx = 0;
    mannequin.vy = 0;

    // Reset Enemy
    if (enemy) {
        enemy.x = canvas.width - 200;
        enemy.y = canvas.height / 2;
        enemy.fireTimer = 0;
    }

    // Clear Projectiles
    projectiles = [];

    // Hide Button
    revivalBtn.style.display = 'none';

    // Restart Loop
    requestAnimationFrame(gameLoop);
}

function update() {
    mannequin.update(input, canvas.height, obstacles, canvas.width); // Pass obstacles and screen width

    // Update Parallax (Simulate camera movement with player velocity)
    backgroundLayers.forEach(layer => layer.update(mannequin.vx));

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();

        // Check Collision with Mannequin
        const dist = Math.hypot(p.x - (mannequin.x + mannequin.width / 2), p.y - (mannequin.y + mannequin.headRadius));
        if (dist < p.radius + mannequin.headRadius + 10) { // Simple hit box
            mannequin.health--;
            projectiles.splice(i, 1);
            continue;
        }

        // Remove if off screen
        if (p.x < -50 || p.x > canvas.width + 50) {
            projectiles.splice(i, 1);
        }
    }

    // Update Enemy (No Inputs)
    if (enemy) {
        enemy.update({ left: false, right: false, jump: false }, canvas.height, obstacles, canvas.width);
        enemy.updateFireTimer();

        // Enemy AI Fire
        if (enemy.canFire()) {
            const ex = enemy.x + enemy.width / 2;
            const ey = enemy.y + enemy.height / 2;
            // Aim at player
            const mx = mannequin.x + mannequin.width / 2;
            const my = mannequin.y + mannequin.height / 2;

            const dx = mx - ex;
            const dy = my - ey;
            const angle = Math.atan2(dy, dx);
            const speed = 7;

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            projectiles.push(new Projectile(ex, ey, vx, vy));
        }
    }
}

function draw() {
    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#87CEEB'); // Sky Blue
    skyGrad.addColorStop(1, '#E0F7FA'); // Light Cyan at horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Parallax Backgrounds (Mountains)
    backgroundLayers.forEach(layer => layer.draw(ctx, canvas.width, canvas.height));

    // 3. Draw Scenery (Background Objects)
    clouds.forEach(c => c.draw(ctx));
    trees.forEach(t => t.draw(ctx));

    // 4. Draw Floor (Pseudo-3D)
    const floorHeight = 50;
    const floorY = canvas.height - floorHeight;

    // Floor Top Face (Grass)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, floorY, canvas.width, floorHeight);

    // Floor Front Face (Darker Earth)
    ctx.fillStyle = '#2E8B57'; // SeaGreen (Darker)
    ctx.fillRect(0, floorY + 10, canvas.width, floorHeight); // Offset slightly down? No, just the bottom part
    // Actually, let's make the "3D" side be the bottom edge of the screen if we had a camera, but here just a strip at the bottom
    ctx.fillStyle = '#3E2723'; // Dark dirt
    ctx.fillRect(0, floorY + 30, canvas.width, 20);


    // 5. Draw Obstacles (with 3D effects)
    obstacles.forEach(obs => obs.draw(ctx));

    // 6. Draw Shadows (for Mannequin and Enemy)
    drawShadow(mannequin);
    if (enemy) drawShadow(enemy);

    // 7. Draw Projectiles
    projectiles.forEach(p => p.draw(ctx));

    // 8. Draw Characters
    mannequin.draw(ctx);
    if (enemy) enemy.draw(ctx);

    // 9. Draw UI
    drawUI();
}

function drawShadow(entity) {
    const floorY = canvas.height - 50;
    // Don't draw shadow if too high up? Or make it smaller
    const distToFloor = floorY - (entity.y + entity.height);
    const scale = Math.max(0.5, 1 - distToFloor / 200);
    const alpha = Math.max(0.1, 0.5 - distToFloor / 200);

    if (distToFloor > -50) { // Only draw if somewhat near ground
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        // Shadow position logic: directly under character x, fixed y at floor or on obstacle?
        // Simple global floor shadow for now
        let shadowY = floorY;
        // Check if on obstacle
        // If entity.y + height is near obstacle top, use that

        ctx.ellipse(entity.x + entity.width / 2, shadowY, (entity.width / 2) * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawUI() {
    const startX = 30;
    const startY = 30;
    const radius = 10;
    const spacing = 30;

    for (let i = 0; i < mannequin.maxHealth; i++) {
        ctx.beginPath();
        const x = startX + (i * spacing);
        ctx.arc(x, startY, radius, 0, Math.PI * 2);

        if (i < mannequin.health) {
            ctx.fillStyle = '#FF0000'; // Red for health
            ctx.fill();
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF'; // White border
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    if (mannequin.health > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        // Game Over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFF';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 130, canvas.height / 2);

        // Show Revival Button
        revivalBtn.style.display = 'block';
    }
}

// Kickoff
init();

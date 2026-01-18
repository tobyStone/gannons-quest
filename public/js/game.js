import { Mannequin } from './mannequin.js';
import { Obstacle } from './obstacle.js';
import { Tree, Cloud, BackgroundLayer } from './scenery.js';
import { Projectile } from './projectile.js';
import { Heart } from './item.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const revivalBtn = document.getElementById('revivalBtn');

let mannequin;
let enemy;
let obstacles = [];
let trees = [];
let clouds = [];
let projectiles = [];
let items = [];
let backgroundLayers = [];

const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init() {
    resize();
    window.addEventListener('resize', resize);

    backgroundLayers = [];

    // Spawn mannequin in center
    mannequin = new Mannequin(100, canvas.height / 2);

    // Spawn Enemy (Red) on Right
    const enemyImage = new Image();
    enemyImage.src = 'images/enemy_monk.png';
    enemy = new Mannequin(canvas.width - 200, canvas.height / 2, enemyImage);

    // Spawn Obstacles (Scattered)
    obstacles = [];
    for (let i = 0; i < 10; i++) {
        obstacles.push(new Obstacle(
            Math.random() * (canvas.width - 100),
            Math.random() * (canvas.height - 100),
            60 + Math.random() * 40,
            40 + Math.random() * 40
        ));
    }

    // Spawn Scenery
    trees = [];
    for (let i = 0; i < 15; i++) {
        trees.push(new Tree(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowRight') input.right = true;
        if (e.code === 'ArrowLeft') input.left = true;
        if (e.code === 'ArrowUp') input.up = true;
        if (e.code === 'ArrowDown') input.down = true;
        if (e.code === 'Space') input.jump = true;

        if (e.code === 'KeyA') mannequin.triggerMist();
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowRight') input.right = false;
        if (e.code === 'ArrowLeft') input.left = false;
        if (e.code === 'ArrowUp') input.up = false;
        if (e.code === 'ArrowDown') input.down = false;
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
    mannequin.isHolding = false;

    // Reset Enemy
    if (enemy) {
        enemy.x = canvas.width - 200;
        enemy.y = canvas.height / 2;
        enemy.fireTimer = 0;
    } else {
        // Respawn Enemy if dead
        const enemyImage = new Image();
        enemyImage.src = 'images/enemy_monk.png';
        enemy = new Mannequin(canvas.width - 200, canvas.height / 2, enemyImage);
    }

    // Clear Projectiles & Items
    projectiles = [];
    items = [];

    // Hide Button
    revivalBtn.style.display = 'none';

    // Restart Loop
    requestAnimationFrame(gameLoop);
}

function update() {
    // Pause movement if holding item
    if (mannequin.isHolding) {
        return;
    }

    mannequin.update(input, canvas.height, obstacles, canvas.width);

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();

        // Check Collision with Mannequin
        const dist = Math.hypot(p.x - (mannequin.x + mannequin.width / 2), p.y - (mannequin.y + mannequin.headRadius));
        if (dist < p.radius + mannequin.headRadius + 10) {
            mannequin.health--;
            projectiles.splice(i, 1);
            continue;
        }

        // Check Collision with Obstacles
        let hit = false;
        for (const obs of obstacles) {
            if (p.x > obs.x && p.x < obs.x + obs.width &&
                p.y > obs.y && p.y < obs.y + obs.height) {
                hit = true;
                break;
            }
        }
        if (hit) {
            projectiles.splice(i, 1);
            continue;
        }

        // Check Collision with Trees
        for (const tree of trees) {
            // Trunk collision only
            if (p.x > tree.x && p.x < tree.x + tree.trunkWidth &&
                p.y > tree.floorY - tree.trunkHeight && p.y < tree.floorY) {
                hit = true;
                break;
            }
        }
        if (hit) {
            projectiles.splice(i, 1);
            continue;
        }

        // Remove if off screen
        if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
            projectiles.splice(i, 1);
        }
    }

    // Update Items
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        // Check collision
        const dist = Math.hypot((mannequin.x + mannequin.width / 2) - item.x, (mannequin.y + mannequin.height / 2) - item.y);
        if (dist < 40) {
            // Pick up!
            items.splice(i, 1);
            mannequin.isHolding = true;
            mannequin.holdingItem = item; // Store ref if needed relative draw, or just generic hold

            // 3 Second Animation
            setTimeout(() => {
                mannequin.maxHealth = Math.min(mannequin.maxHealth + 1, 10); // Cap at 10 maybe?
                mannequin.health = mannequin.maxHealth;
                mannequin.isHolding = false;
            }, 3000);

            continue;
        }
    }


    // Update Enemy (No Inputs)
    if (enemy) {
        // Simple Chase AI
        const dx = (mannequin.x + mannequin.width / 2) - (enemy.x + enemy.width / 2);
        const dy = (mannequin.y + mannequin.height / 2) - (enemy.y + enemy.height / 2);
        const dist = Math.hypot(dx, dy);

        let enemyInput = { right: false, left: false, up: false, down: false };
        if (dist > 100) { // Keep distance
            if (dx > 10) enemyInput.right = true;
            if (dx < -10) enemyInput.left = true;
            if (dy > 10) enemyInput.down = true;
            if (dy < -10) enemyInput.up = true;
        }

        enemy.update(enemyInput, canvas.height, obstacles, canvas.width);
        enemy.updateFireTimer();

        if (enemy.canFire()) {
            const ex = enemy.x + enemy.width / 2;
            const ey = enemy.y + enemy.height / 2;
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

        if (mannequin.mistTimer > 0) {
            const dist = Math.hypot((mannequin.x + mannequin.width / 2) - (enemy.x + enemy.width / 2),
                (mannequin.y + mannequin.height / 2) - (enemy.y + enemy.height / 2));
            if (dist < 100) {
                // Enemy dies, drop Heart
                items.push(new Heart(enemy.x, enemy.y));
                enemy = null;
            }
        }
    }
}

function draw() {
    // 1. Full Grass Background
    ctx.fillStyle = '#4CAF50'; // Green Grass
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pattern for grass texture
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
            if ((i + j) % 80 === 0) ctx.fillRect(i, j, 40, 40);
        }
    }

    // 2. Depth Sorting
    // Collect all renderables
    let renderables = [];

    // Player
    renderables.push({ type: 'mannequin', y: mannequin.y + mannequin.height, obj: mannequin });

    // Enemy
    if (enemy) {
        renderables.push({ type: 'mannequin', y: enemy.y + enemy.height, obj: enemy });
    }

    // Obstacles
    obstacles.forEach(obs => {
        renderables.push({ type: 'obstacle', y: obs.y + obs.height, obj: obs });
    });

    // Trees
    trees.forEach(tree => {
        // Tree floorY is the bottom of the trunk (for depth sorting)
        renderables.push({ type: 'tree', y: tree.floorY, obj: tree });
    });

    // Projectiles
    projectiles.forEach(p => {
        renderables.push({ type: 'projectile', y: p.y, obj: p });
    });

    // Items (Hearts)
    items.forEach(item => {
        renderables.push({ type: 'item', y: item.y + item.height, obj: item });
    });

    // Sort by Y (smaller Y first -> draw first)
    renderables.sort((a, b) => a.y - b.y);

    // Draw Renderables
    renderables.forEach(item => {
        // Draw Shadow just before object
        if (item.type === 'mannequin') {
            drawShadow(item.obj);
        }
        item.obj.draw(ctx);

        // If holding, draw held item above head (cheap hack, normally part of drawHolding)
        // Actually drawHolding handles it? No, drawHolding just poses. 
        // We should draw the heart above the player if isHolding.
        if (item.type === 'mannequin' && item.obj.isHolding && item.obj === mannequin) {
            // Draw floating heart above head
            // New Heart instance just for visual or reuse? 
            // Just draw a heart shape
            ctx.save();
            ctx.translate(mannequin.x + 10, mannequin.y - 40);
            // Quick Heart Draw
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(0, -6, -10, -6, -10, 0);
            ctx.bezierCurveTo(-10, 10, 0, 16, 0, 20);
            ctx.bezierCurveTo(0, 16, 10, 10, 10, 0);
            ctx.bezierCurveTo(10, -6, 0, -6, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    });

    // Draw Renderables
    renderables.forEach(item => {
        // Draw Shadow just before object
        if (item.type === 'mannequin') {
            drawShadow(item.obj);
        }
        item.obj.draw(ctx);
    });

    // 3. Clouds (High Above - float over everything)
    clouds.forEach(c => c.draw(ctx));

    // 4. UI
    drawUI();
}

function drawShadow(entity) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    // Shadow at feet
    const shadowY = entity.y + entity.height;
    ctx.ellipse(entity.x + entity.width / 2, shadowY, entity.width / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
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

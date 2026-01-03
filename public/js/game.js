import { Mannequin } from './mannequin.js';
import { Obstacle } from './obstacle.js';
import { Tree, Cloud } from './scenery.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let mannequin;
let enemy;
let obstacles = [];
let trees = [];
let clouds = [];

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

    // Spawn mannequin in center
    mannequin = new Mannequin(100, canvas.height / 2); // Start on left

    // Spawn Enemy (Red) on Right
    enemy = new Mannequin(canvas.width - 200, canvas.height / 2, '#FF0000');

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

    // Start Loop
    requestAnimationFrame(gameLoop);
}

function update() {
    mannequin.update(input, canvas.height, obstacles); // Pass obstacles

    // Update Enemy (No Inputs)
    enemy.update({ left: false, right: false, jump: false }, canvas.height, obstacles);
}

function draw() {
    // Clear Screen (Sky Blue is set in CSS, so just clear)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Floor (Plains)
    ctx.fillStyle = '#4CAF50'; // Green
    const floorHeight = 50;
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);

    // Draw Scenery (Background)
    clouds.forEach(c => c.draw(ctx));
    trees.forEach(t => t.draw(ctx));

    // Draw Obstacles
    obstacles.forEach(obs => obs.draw(ctx));

    // Draw Mannequin
    mannequin.draw(ctx);

    // Draw Enemy
    if (enemy) enemy.draw(ctx);

    // Draw UI
    drawUI();
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
    requestAnimationFrame(gameLoop);
}

// Kickoff
init();

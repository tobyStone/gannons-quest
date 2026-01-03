import { Mannequin } from './mannequin.js';
import { Obstacle } from './obstacle.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let mannequin;
let obstacles = [];

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

    // Spawn Obstacles (Rocks)
    obstacles = [
        new Obstacle(400, canvas.height - 150, 100, 100),   // Big Rock
        new Obstacle(700, canvas.height - 100, 60, 50),     // Small Step
        new Obstacle(850, canvas.height - 200, 80, 150),    // Tall Pillar
    ];

    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowRight') input.right = true;
        if (e.code === 'ArrowLeft') input.left = true;
        if (e.code === 'Space') input.jump = true;
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
}

function draw() {
    // Clear Screen (Sky Blue is set in CSS, so just clear)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Floor (Plains)
    ctx.fillStyle = '#4CAF50'; // Green
    const floorHeight = 50;
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);

    // Draw Obstacles
    obstacles.forEach(obs => obs.draw(ctx));

    // Draw Mannequin
    mannequin.draw(ctx);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Kickoff
init();

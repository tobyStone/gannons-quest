import { Mannequin } from './mannequin.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let mannequin;
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
    mannequin = new Mannequin(canvas.width / 2, canvas.height / 2);

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
    mannequin.update(input, canvas.height);
}

function draw() {
    // Clear Screen (Sky Blue is set in CSS, so just clear)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Floor (Plains)
    ctx.fillStyle = '#4CAF50'; // Green
    const floorHeight = 50;
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);

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

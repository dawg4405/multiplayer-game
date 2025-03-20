// Game Variables
const viewportWidth = 800;
const viewportHeight = 600;
const tileSize = 50; // Size of each grid square in pixels
const mapSize = 3000; // 3000x3000 grid
let player = { x: 1, y: 1, health: 100 };
let startX = 0;
let startY = 0;

// Canvas Setup
const canvas = document.getElementById('game-map');
const ctx = canvas.getContext('2d');

// Render Viewport
function renderViewport() {
  startX = Math.max(0, player.x - Math.floor(viewportWidth / (2 * tileSize)));
  startY = Math.max(0, player.y - Math.floor(viewportHeight / (2 * tileSize)));
  const endX = Math.min(mapSize, startX + Math.floor(viewportWidth / tileSize));
  const endY = Math.min(mapSize, startY + Math.floor(viewportHeight / tileSize));

  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  // Draw Grid
  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
      ctx.strokeRect((x - startX) * tileSize, (y - startY) * tileSize, tileSize, tileSize);
    }
  }

  // Draw Player
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(
    (player.x - startX) * tileSize + tileSize / 2,
    (player.y - startY) * tileSize + tileSize / 2,
    tileSize / 3, 0, 2 * Math.PI
  );
  ctx.fill();

  // Update Coordinates Display
  document.getElementById('coordinates').textContent = `Current Coordinates: (${player.x},${player.y})`;
}

// Player Movement
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': player.y = Math.max(1, player.y - 1); break;
    case 'ArrowDown': player.y = Math.min(mapSize, player.y + 1); break;
    case 'ArrowLeft': player.x = Math.max(1, player.x - 1); break;
    case 'ArrowRight': player.x = Math.min(mapSize, player.x + 1); break;
  }
  renderViewport();
});

// Health System
function reduceHealth(damage) {
  player.health -= damage;
  document.getElementById('health').style.width = `${player.health}%`;
  if (player.health <= 0) {
    gameOver();
  }
}

// Game Over Mechanics
function gameOver() {
  document.getElementById('game-over-menu').style.display = 'block';
  let count = 10;
  const countdownInterval = setInterval(() => {
    document.getElementById('countdown').textContent = count;
    count--;
    if (count < 0) {
      clearInterval(countdownInterval);
      respawn();
    }
  }, 1000);
}

function respawn() {
  player.health = 100;
  player.x = Math.floor(Math.random() * mapSize) + 1;
  player.y = Math.floor(Math.random() * mapSize) + 1;
  document.getElementById('game-over-menu').style.display = 'none';
  renderViewport();
}

// Initialize Game
renderViewport();

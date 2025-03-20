// Game Variables
const viewportWidth = 800;
const viewportHeight = 600;
const tileSize = 50;
const mapSize = 3000;
let player = { x: 1500, y: 1500, health: 100, weapon: null };
let weapons = [{ x: 100, y: 100, type: 'gun' }]; // Example weapon
let otherPlayers = [];

// Canvas Setup
const canvas = document.getElementById('game-map');
const ctx = canvas.getContext('2d');

// Smooth Movement
let targetX = player.x;
let targetY = player.y;
const moveSpeed = 2;

function lerp(start, end, speed) {
  return start + (end - start) * speed;
}

// Render Viewport
function renderViewport() {
  const offsetX = (viewportWidth / 2) - player.x * tileSize;
  const offsetY = (viewportHeight / 2) - player.y * tileSize;

  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  // Draw Grid (visible area only)
  const startX = Math.floor((player.x - viewportWidth / (2 * tileSize)) / tileSize);
  const startY = Math.floor((player.y - viewportHeight / (2 * tileSize)) / tileSize);
  const endX = Math.ceil((player.x + viewportWidth / (2 * tileSize)) / tileSize);
  const endY = Math.ceil((player.y + viewportHeight / (2 * tileSize)) / tileSize);

  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
      ctx.strokeRect(x * tileSize + offsetX, y * tileSize + offsetY, tileSize, tileSize);
    }
  }

  // Draw Player
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(viewportWidth / 2, viewportHeight / 2, tileSize / 3, 0, 2 * Math.PI);
  ctx.fill();

  // Draw Weapons
  weapons.forEach(weapon => {
    ctx.fillStyle = 'red';
    ctx.fillRect(weapon.x * tileSize + offsetX, weapon.y * tileSize + offsetY, tileSize / 2, tileSize / 2);
  });

  // Update Coordinates
  document.getElementById('coordinates').textContent = `Current Coordinates: (${player.x},${player.y})`;
}

// Movement
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': targetY = Math.max(1, player.y - 1); break;
    case 'ArrowDown': targetY = Math.min(mapSize, player.y + 1); break;
    case 'ArrowLeft': targetX = Math.max(1, player.x - 1); break;
    case 'ArrowRight': targetX = Math.min(mapSize, player.x + 1); break;
  }
});

// Game Loop
function gameLoop() {
  player.x = lerp(player.x, targetX, moveSpeed * 0.1);
  player.y = lerp(player.y, targetY, moveSpeed * 0.1);
  renderViewport();
  requestAnimationFrame(gameLoop);
}

gameLoop();

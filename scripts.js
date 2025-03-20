const ws = new WebSocket('ws://localhost:3000');
const canvas = document.getElementById('game-map');
const ctx = canvas.getContext('2d');
const viewportWidth = 800;
const viewportHeight = 600;
const tileSize = 50;
const mapSize = 3000; // 3000x3000 grid
let playerId;
let players = {};
let weapons = [];
let player = { x: 1500, y: 1500, health: 100, weapon: null }; // Local player

// Smooth Movement
let targetX = player.x;
let targetY = player.y;
const moveSpeed = 0.1; // Slower speed for smoother movement

// Linear Interpolation for Smooth Movement
function lerp(start, end, speed) {
  return start + (end - start) * speed;
}

// Render Grid and Players
function renderViewport() {
  const offsetX = viewportWidth / 2 - player.x * tileSize;
  const offsetY = viewportHeight / 2 - player.y * tileSize;

  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  // Draw Grid (always visible)
  const startX = Math.floor((player.x - viewportWidth / (2 * tileSize)) / tileSize);
  const startY = Math.floor((player.y - viewportHeight / (2 * tileSize)) / tileSize);
  const endX = Math.ceil((player.x + viewportWidth / (2 * tileSize)) / tileSize);
  const endY = Math.ceil((player.y + viewportHeight / (2 * tileSize)) / tileSize);

  ctx.strokeStyle = '#ccc'; // Grid color
  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
      ctx.strokeRect(
        x * tileSize + offsetX,
        y * tileSize + offsetY,
        tileSize,
        tileSize
      );
    }
  }

  // Draw Weapons
  weapons.forEach(weapon => {
    ctx.fillStyle = 'red';
    ctx.fillRect(
      weapon.x * tileSize + offsetX,
      weapon.y * tileSize + offsetY,
      tileSize / 2,
      tileSize / 2
    );
  });

  // Draw Local Player
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(viewportWidth / 2, viewportHeight / 2, tileSize / 3, 0, 2 * Math.PI);
  ctx.fill();

  // Draw Other Players
  Object.keys(players).forEach(id => {
    if (id !== playerId) {
      const otherPlayer = players[id];
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(
        (otherPlayer.x - player.x) * tileSize + viewportWidth / 2,
        (otherPlayer.y - player.y) * tileSize + viewportHeight / 2,
        tileSize / 3, 0, 2 * Math.PI
      );
      ctx.fill();
    }
  });

  // Update Coordinates Display
  document.getElementById('coordinates').textContent = `Current Coordinates: (${Math.floor(player.x)},${Math.floor(player.y)})`;
}

// Handle WebSocket Messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'init':
      playerId = data.playerId;
      players = Object.fromEntries(data.players);
      weapons = data.weapons;
      break;

    case 'player-joined':
      players[data.playerId] = data.player;
      break;

    case 'player-moved':
      players[data.playerId].x = data.x;
      players[data.playerId].y = data.y;
      break;

    case 'player-left':
      delete players[data.playerId];
      break;

    case 'weapon-picked-up':
      weapons = weapons.filter(w => w.x !== data.x || w.y !== data.y);
      break;
  }
};

// Handle Player Movement
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': targetY = Math.max(1, player.y - 1); break;
    case 'ArrowDown': targetY = Math.min(mapSize, player.y + 1); break;
    case 'ArrowLeft': targetX = Math.max(1, player.x - 1); break;
    case 'ArrowRight': targetX = Math.min(mapSize, player.x + 1); break;
  }

  // Send Movement Update to Server
  ws.send(JSON.stringify({
    type: 'move',
    x: targetX,
    y: targetY,
  }));
});

// Game Loop
function gameLoop() {
  // Smoothly move the player towards the target position
  player.x = lerp(player.x, targetX, moveSpeed);
  player.y = lerp(player.y, targetY, moveSpeed);

  // Render the game
  renderViewport();

  // Repeat
  requestAnimationFrame(gameLoop);
}

// Start the Game Loop
gameLoop();

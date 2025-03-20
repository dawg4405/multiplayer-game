const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const coordinatesDisplay = document.getElementById('coordinates');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Connect to the server
const socket = io();

// Game state
let players = {};
let myId;
const gridSize = 100; // 100x100 grid
const squareSize = 40; // Each square is 40x40 pixels

// Load custom character image
const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/dawg4405/my-game-assets/refs/heads/main/player.png'; // Replace with your RawGitHub link

// Handle initial game state
socket.on('currentPlayers', (data) => {
  players = data.players;
  myId = socket.id;
});

// Handle new players
socket.on('newPlayer', (newPlayer) => {
  players[newPlayer.id] = newPlayer;
});

// Handle player movement
socket.on('playerMoved', (playerData) => {
  players[playerData.id].x = playerData.x;
  players[playerData.id].y = playerData.y;
});

// Handle player health updates
socket.on('playerHealthUpdate', (playerData) => {
  players[playerData.id].health = playerData.health;
});

// Handle player disconnection
socket.on('playerDisconnected', (playerId) => {
  delete players[playerId];
});

// Movement keys
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  Shift: false
};

// Event listeners for key presses
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Update player position
function updatePlayer() {
  const moveAmount = keys.Shift ? 5 : 1;

  if (keys.w && players[myId].y > 0) players[myId].y -= moveAmount;
  if (keys.a && players[myId].x > 0) players[myId].x -= moveAmount;
  if (keys.s && players[myId].y < gridSize - 1) players[myId].y += moveAmount;
  if (keys.d && players[myId].x < gridSize - 1) players[myId].x += moveAmount;

  // Send updated position to the server
  socket.emit('playerMovement', {
    x: players[myId].x,
    y: players[myId].y,
  });
}

// Handle shooting
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  socket.emit('shoot', { x: clickX, y: clickY });
});

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate camera offset to center the player
  const cameraX = players[myId].x * squareSize - canvas.width / 2;
  const cameraY = players[myId].y * squareSize - canvas.height / 2;

  // Draw grid
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const color = (x + y) % 2 === 0 ? '#FFFFFF' : '#CCCCCC'; // Checkered pattern
      ctx.fillStyle = color;
      ctx.fillRect(x * squareSize - cameraX, y * squareSize - cameraY, squareSize, squareSize);
    }
  }

  // Draw players
  Object.values(players).forEach((player) => {
    // Draw player
    ctx.drawImage(playerImage, player.x * squareSize - cameraX, player.y * squareSize - cameraY, squareSize, squareSize);

    // Draw health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x * squareSize - cameraX, player.y * squareSize - cameraY - 10, squareSize, 5);
    ctx.fillStyle = 'lime';
    ctx.fillRect(player.x * squareSize - cameraX, player.y * squareSize - cameraY - 10, (player.health / 100) * squareSize, 5);
  });

  // Update coordinates display
  coordinatesDisplay.textContent = `X: ${players[myId].x}, Y: ${players[myId].y}`;
}

// Game loop
function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const coordinatesDisplay = document.getElementById('coordinates');
const playerCountDisplay = document.getElementById('playerCount');

// Connect to the server
const socket = io();

// Game state
let players = {};
let myId;
let weapon = { x: 500, y: 500, isEquipped: false };

// Load custom character image
const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/dawg4405/my-game-assets/refs/heads/main/player.png'; // Replace with your RawGitHub link

// Handle initial game state
socket.on('currentPlayers', (data) => {
  players = data.players;
  weapon = data.weapon;
  myId = socket.id;
});

// Handle new players
socket.on('newPlayer', (newPlayer) => {
  players[newPlayer.id] = newPlayer;
  updatePlayerCount();
});

// Handle player movement
socket.on('playerMoved', (playerData) => {
  players[playerData.id].x = playerData.x;
  players[playerData.id].y = playerData.y;
});

// Handle weapon pickup
socket.on('weaponEquipped', (data) => {
  players[data.id].isEquipped = true;
  weapon.isEquipped = true;
});

// Handle player health updates
socket.on('playerHealthUpdate', (playerData) => {
  players[playerData.id].health = playerData.health;
});

// Handle player disconnection
socket.on('playerDisconnected', (playerId) => {
  delete players[playerId];
  updatePlayerCount();
});

// Update player count
function updatePlayerCount() {
  playerCountDisplay.textContent = `Players: ${Object.keys(players).length}`;
}

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

  if (keys.w) players[myId].y -= moveAmount;
  if (keys.a) players[myId].x -= moveAmount;
  if (keys.s) players[myId].y += moveAmount;
  if (keys.d) players[myId].x += moveAmount;

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

  // Draw players
  Object.values(players).forEach((player) => {
    // Draw player
    ctx.drawImage(playerImage, player.x, player.y, 10, 10);

    // Draw health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, 40, 5);
    ctx.fillStyle = 'lime';
    ctx.fillRect(player.x, player.y - 10, (player.health / 100) * 40, 5);
  });

  // Draw weapon
  if (!weapon.isEquipped) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(weapon.x, weapon.y, 10, 10);
  }

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

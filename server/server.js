const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Game State
const players = new Map(); // Stores all connected players
const weapons = [{ x: 100, y: 100, type: 'gun' }]; // Example weapon

// Broadcast Function
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket Connection
wss.on('connection', (ws) => {
  console.log('New player connected');

  // Assign a unique ID to the player
  const playerId = Math.random().toString(36).substring(7);
  players.set(playerId, { x: 1500, y: 1500, health: 100, weapon: null });

  // Send initial game state to the player
  ws.send(JSON.stringify({
    type: 'init',
    playerId,
    players: Array.from(players.entries()),
    weapons,
  }));

  // Broadcast new player to others
  broadcast({
    type: 'player-joined',
    playerId,
    player: players.get(playerId),
  });

  // Handle Player Updates
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'move':
        players.set(playerId, { ...players.get(playerId), x: data.x, y: data.y });
        broadcast({
          type: 'player-moved',
          playerId,
          x: data.x,
          y: data.y,
        });
        break;

      case 'shoot':
        broadcast({
          type: 'player-shot',
          playerId,
          direction: data.direction,
        });
        break;

      case 'pickup-weapon':
        const weaponIndex = weapons.findIndex(w => w.x === data.x && w.y === data.y);
        if (weaponIndex !== -1) {
          players.set(playerId, { ...players.get(playerId), weapon: weapons[weaponIndex].type });
          weapons.splice(weaponIndex, 1);
          broadcast({
            type: 'weapon-picked-up',
            playerId,
            weapon: players.get(playerId).weapon,
          });
        }
        break;
    }
  });

  // Handle Player Disconnection
  ws.on('close', () => {
    console.log('Player disconnected');
    players.delete(playerId);
    broadcast({
      type: 'player-left',
      playerId,
    });
  });
});

// Serve Frontend Files
app.use(express.static('../public'));

// Start Server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

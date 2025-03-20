const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const players = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Add new player to the game
  players[socket.id] = {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    health: 100,
  };

  // Send current game state to the new player
  socket.emit('currentPlayers', { players });

  // Notify other players about the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Handle player movement
  socket.on('playerMovement', (movement) => {
    if (players[socket.id]) {
      players[socket.id].x = movement.x;
      players[socket.id].y = movement.y;
      // Broadcast updated position to all players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: movement.x,
        y: movement.y,
      });
    }
  });

  // Handle shooting
  socket.on('shoot', (target) => {
    const shooter = players[socket.id];
    const targetPlayer = Object.values(players).find(
      (player) =>
        player.x === target.x && player.y === target.y
    );

    if (targetPlayer && targetPlayer.health > 0) {
      targetPlayer.health -= 10; // Reduce health by 10 ticks
      if (targetPlayer.health <= 0) {
        targetPlayer.health = 100; // Respawn
        targetPlayer.x = Math.floor(Math.random() * 100);
        targetPlayer.y = Math.floor(Math.random() * 100);
      }
      // Broadcast updated health to all players
      io.emit('playerHealthUpdate', {
        id: Object.keys(players).find((key) => players[key] === targetPlayer),
        health: targetPlayer.health,
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

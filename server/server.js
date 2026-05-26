/**
 * Minimal LAN Chess Server
 * Run with: node server.js
 *
 * This is the simplest possible authoritative server for testing.
 */

import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8765;

const wss = new WebSocketServer({ port: PORT });

let players = []; // max 2
let currentTurn = 'w'; // Simple turn tracking for relay

console.log(`Chess LAN server running on port ${PORT}`);
console.log(`Other player should connect to your local IP on port ${PORT}`);

wss.on('connection', (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    ws.close();
    return;
  }

  const playerId = players.length;
  const color = playerId === 0 ? 'w' : 'b';
  
  players.push({ ws, color, id: playerId });

  console.log(`Player ${playerId} (${color}) connected`);

  ws.send(JSON.stringify({
    type: 'welcome',
    playerId,
    color,
    message: `You are playing as ${color === 'w' ? 'White' : 'Black'}`
  }));

  // If second player joins, notify both and reset turn
  if (players.length === 2) {
    currentTurn = 'w';
    players.forEach(p => {
      p.ws.send(JSON.stringify({
        type: 'gameStart',
        yourColor: p.color,
        opponentColor: p.color === 'w' ? 'b' : 'w'
      }));
    });
    console.log('Game started - 2 players connected');
  }

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(playerId, message);
    } catch (e) {
      console.error('Bad message:', data.toString());
    }
  });

  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    players = players.filter(p => p.id !== playerId);
    
    // Notify remaining player
    players.forEach(p => {
      p.ws.send(JSON.stringify({ type: 'opponentDisconnected' }));
    });
  });
});

function handleMessage(playerId, message) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  if (message.type === 'move') {
    // Basic turn enforcement on the server (relay version)
    if (player.color !== currentTurn) {
      player.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not your turn' 
      }));
      return;
    }

    console.log(`Move from ${player.color}:`, message);

    // Switch turn
    currentTurn = currentTurn === 'w' ? 'b' : 'w';

    // Broadcast to the other player only
    players.forEach(p => {
      if (p.id !== playerId) {
        p.ws.send(JSON.stringify({
          type: 'move',
          from: message.from,
          to: message.to,
          promotion: message.promotion,
          player: player.color
        }));
      }
    });
  }

  if (message.type === 'resign') {
    players.forEach(p => {
      if (p.id !== playerId) {
        p.ws.send(JSON.stringify({ type: 'opponentResigned' }));
      }
    });
  }
}

console.log('\nWaiting for players to connect...');

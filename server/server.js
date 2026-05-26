/**
 * Grok 3D Chess - LAN Server (Improved Simple Version)
 * 
 * Features:
 * - Serves the entire game over HTTP
 * - WebSocket for real-time play
 * - First player = White, Second player = Black
 * - Basic turn enforcement
 * 
 * Run with: node server.js
 * 
 * Players just need to open: http://YOUR-IP:8765
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 8765;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

let players = [];
let currentTurn = 'w';
let nextPlayerId = 0;

// Create HTTP + WebSocket server on same port
const server = http.createServer((req, res) => {
  // Serve index.html for root
  let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url);

  // Prevent path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }

    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
    };

    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

const wss = new WebSocketServer({ server });

console.log(`\n=== Grok 3D Chess LAN Server ===`);
console.log(`Running on port ${PORT}`);
console.log(`\nHow to play:`);
console.log(`  1. Open http://localhost:${PORT} in your browser (you will be White)`);
console.log(`  2. Tell the other player your local IP, e.g.:`);
console.log(`     http://192.168.1.42:${PORT}`);
console.log(`\nWaiting for connections...\n`);

wss.on('connection', (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    ws.close();
    return;
  }

  const playerId = nextPlayerId++;
  const color = players.length === 0 ? 'w' : 'b';

  const player = { id: playerId, color, ws };
  players.push(player);

  console.log(`Player ${playerId} connected as ${color}`);

  ws.send(JSON.stringify({
    type: 'welcome',
    playerId,
    color,
  }));

  if (players.length === 2) {
    currentTurn = 'w';
    players.forEach(p => {
      p.ws.send(JSON.stringify({
        type: 'gameStart',
        yourColor: p.color,
        opponentColor: p.color === 'w' ? 'b' : 'w'
      }));
    });
    console.log('Game started!');
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(playerId, msg);
    } catch (e) {
      console.error('Bad message:', data.toString());
    }
  });

  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    players = players.filter(p => p.id !== playerId);
    players.forEach(p => p.ws.send(JSON.stringify({ type: 'opponentDisconnected' })));
  });
});

function handleMessage(playerId, msg) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  if (msg.type === 'move') {
    if (player.color !== currentTurn) {
      player.ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
      return;
    }

    console.log(`Move from ${player.color}: ${msg.from} → ${msg.to}`);

    currentTurn = currentTurn === 'w' ? 'b' : 'w';

    // Send to the other player
    players.forEach(p => {
      if (p.id !== playerId) {
        p.ws.send(JSON.stringify({
          type: 'move',
          from: msg.from,
          to: msg.to,
          promotion: msg.promotion,
          player: player.color
        }));
      }
    });
  }

  if (msg.type === 'resign') {
    players.forEach(p => {
      if (p.id !== playerId) {
        p.ws.send(JSON.stringify({ type: 'opponentResigned' }));
      }
    });
  }
}

server.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});
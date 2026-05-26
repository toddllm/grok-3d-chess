# grok-3d-chess — v2: LAN Multiplayer Plan

## Goals

- Enable real-time 2-player chess over a local network (LAN).
- Keep the excellent 3D experience and visual design.
- One player hosts, the other joins.
- Authoritative game state (no cheating).
- Graceful handling of disconnects.
- Still fully playable as single-player when not networked.

## High-Level Architecture Recommendation

**Host-Client model with WebSockets**

- One player runs the game + starts a small local server.
- The other player connects by entering the host's local IP + port.
- The **host is the source of truth** for the game state.
- All moves are validated on the host before being broadcast.

### Why this model?
- Much simpler and more reliable than WebRTC peer-to-peer for a first multiplayer version.
- Works great on LAN (no NAT traversal problems).
- Easy to debug.
- Easy to later extend with a dedicated server if desired.

## Major Challenges & Required Changes

### 1. Extract a Clean Chess Engine (Biggest Task)

Current problem: All game state and logic lives in global variables inside `index.html`.

**Needed:**
- Create `chess-engine.js` (or a module) that is completely independent of the UI.
- It should expose a clean API:
  - `makeMove(from, to, promotion?)`
  - `getLegalMoves(square)`
  - `getGameState()` (full serializable state)
  - `isInCheck(color)`
  - `getWinner()` / `isGameOver()`
  - Events / callbacks for state changes

The current Three.js rendering, piece selection, and move highlighting should become a **View** that reacts to the engine.

This refactor is the foundation for networking.

### 2. Networking Layer

**Recommended stack for v2:**
- Node.js + `ws` (very lightweight WebSocket library) or Socket.io (easier reconnection + rooms).

**Message Protocol (JSON)**

Suggested messages:

```json
// Client → Host
{ "type": "join", "playerName": "Alice" }
{ "type": "move", "from": "e2", "to": "e4" }
{ "type": "resign" }

// Host → Client
{ "type": "gameState", "fen": "...", "turn": "w", "inCheck": true, ... }
{ "type": "moveResult", "success": true, "move": {...} }
{ "type": "error", "message": "..." }
{ "type": "opponentDisconnected" }
```

### 3. Connection Flow

1. Host clicks "Host Game" → starts WebSocket server on a port (e.g. 8765).
2. Host sees their local IP (e.g. `192.168.1.42:8765`).
3. Client opens the same `index.html`, clicks "Join Game", enters IP:port.
4. Connection established → full game state is sent to the joining player.
5. Players are automatically assigned colors (Host = White by default, or choice).

## Recommended Phased Approach

### Phase 0: Preparation (Small)
- Add basic project structure (`src/`, `server/`)
- Set up a tiny dev server (optional but helpful)

### Phase 1: Chess Engine Extraction (Critical)
- Pull all chess logic out of `index.html`
- Make the engine fully testable in isolation
- Keep the 3D UI working exactly as before (no regressions)

### Phase 2: Local WebSocket Server + Client
- Create a minimal `server.js`
- Create networking modules on the client side
- Basic connection UI (Host / Join)

### Phase 3: Multiplayer Integration
- Move validation goes through the host
- Turn enforcement over the network
- Full game state synchronization
- Handling of check, promotion, castling, etc. over the wire

### Phase 4: Polish & Resilience
- Reconnection support
- "Waiting for opponent..." states
- Simple chat (nice to have)
- Disconnect / resign handling
- Better connection error messages

## Open Questions (to decide before coding)

1. **Hosting model**
   - Should the host always be White?
   - Or should the host be able to choose color?

2. **Discovery**
   - Manual IP entry (simplest for v2)?
   - Or automatic LAN discovery using Bonjour/mDNS?

3. **Tech stack preference**
   - Node + `ws` (minimal)?
   - Node + Socket.io (more features)?
   - Something else (Deno, Bun, Go, etc.)?

4. **State authority**
   - Strict host authority (recommended)?
   - Or allow some client-side prediction?

5. **Future extensibility**
   - Do we want to design this so a dedicated server (for internet play) could be added later with minimal changes?

6. **UI/UX**
   - How should the connection screen look?
   - Should we keep the single-file nature as much as possible, or accept some build tooling for v2?

## Suggested First Milestone (MVP)

A working LAN game where:
- One player hosts
- Second player connects via IP
- They can play a full game with correct rules
- The game ends on checkmate/stalemate
- One player can resign

Everything else (reconnection, chat, nice UI, etc.) can come after the core loop works.

## Risks & Mitigations

- **Risk**: Refactoring the chess logic breaks the beautiful single-file experience.
  - **Mitigation**: Keep the current `index.html` working at all times. Extract gradually.

- **Risk**: Networking code becomes messy and tightly coupled to UI.
  - **Mitigation**: Clear separation between `ChessEngine`, `NetworkClient`, and `Renderer`.

- **Risk**: State synchronization bugs (desyncs).
  - **Mitigation**: Host is always authoritative. Clients are "dumb" renderers + input collectors.

---

**Next step recommendation**:  
Once you're ready, we should start with **Phase 1** (Chess Engine extraction). This is the highest-leverage work and will make everything else much easier.

Would you like me to draft a more detailed technical spec / task breakdown for Phase 1?

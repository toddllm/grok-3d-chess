# grok-3d-chess

A fully playable 3D chess game built with vanilla JavaScript and Three.js.

![3D Chess Screenshot](https://raw.githubusercontent.com/tdeshane/grok-3d-chess/main/screenshot.png)

## Features

- Complete chess rules (castling, en passant, promotion, check, checkmate, stalemate)
- Smooth 3D rendering with Three.js (no build step required)
- Intuitive controls:
  - Drag to orbit the camera
  - Scroll to zoom
  - Click pieces to select
  - Click highlighted squares (or green/red markers) to move
- Clear visual feedback for legal moves (green) and captures (red rings around enemy pieces)
- Strong legal move enforcement, including when the king is in check
- Works completely offline — just open `index.html`

## How to Play

Simply open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

No installation, no build tools, no server required.

## Controls

| Action              | Control                  |
|---------------------|--------------------------|
| Orbit camera        | Left-click + drag        |
| Zoom                | Scroll wheel             |
| Select piece        | Click on your piece      |
| Make a move         | Click a green dot or red ring |
| Quick views         | Buttons: White / Black / Reset |

## Technology

- Pure vanilla JavaScript (no frameworks)
- Three.js (r128) for 3D rendering
- Tailwind CSS (via CDN) for the UI

Everything is contained in a single `index.html` file for maximum simplicity.

## Future Plans (v2+)

- Online multiplayer over LAN / WebSockets
- AI opponent (basic minimax or stronger engine)
- Move history / PGN export
- Sound effects & animations polish
- Mobile touch improvements

## License

MIT

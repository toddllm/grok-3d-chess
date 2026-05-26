/**
 * ChessGame - Core chess logic extracted for both client and server use.
 * This is the foundation for multiplayer.
 */
export class ChessGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.currentTurn = 'w';
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantTarget = null;
    this.moveHistory = [];

    this._setupInitialPosition();
  }

  _setupInitialPosition() {
    const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    
    for (let f = 0; f < 8; f++) {
      // White
      this.board[f][1] = { type: 'p', color: 'w' };
      this.board[f][0] = { type: backRank[f], color: 'w' };
      
      // Black
      this.board[f][6] = { type: 'p', color: 'b' };
      this.board[f][7] = { type: backRank[f], color: 'b' };
    }
  }

  // Returns a serializable game state (good for sending over network)
  getGameState() {
    return {
      board: JSON.parse(JSON.stringify(this.board)),
      currentTurn: this.currentTurn,
      castlingRights: { ...this.castlingRights },
      enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
      moveHistory: [...this.moveHistory]
    };
  }

  loadGameState(state) {
    this.board = JSON.parse(JSON.stringify(state.board));
    this.currentTurn = state.currentTurn;
    this.castlingRights = { ...state.castlingRights };
    this.enPassantTarget = state.enPassantTarget ? { ...state.enPassantTarget } : null;
    this.moveHistory = [...(state.moveHistory || [])];
  }

  getPieceAt(file, rank) {
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return this.board[file][rank];
  }

  // TODO: Full getLegalMoves + wouldLeaveKingInCheck will be moved here in next steps
  // For the first multiplayer iteration we will rely on the existing logic in index.html
  // and do server-side validation using a copied version.

  // Placeholder - will be properly implemented
  isInCheck(color) {
    // For now this is a stub. Real implementation will come when we extract the full engine.
    return false;
  }
}

/**
 * Very simple WebSocket client for LAN multiplayer (v2 minimal version)
 */
export class ChessNetworkClient {
  constructor() {
    this.ws = null;
    this.onMessage = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[Network] Connected to', url);
        if (this.onOpen) this.onOpen();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error('Bad message from server', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[Network] Disconnected');
        if (this.onClose) this.onClose();
      };

      this.ws.onerror = (err) => {
        console.error('[Network] Error', err);
        if (this.onError) this.onError(err);
        reject(err);
      };
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Tried to send while not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

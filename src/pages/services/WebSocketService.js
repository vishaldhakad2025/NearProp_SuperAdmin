
// src/services/WebSocketService.js
let webSocketInstance = null;

export const getWebSocketService = ({ role, url, token, chatRoomId }) => {
  if (!webSocketInstance || webSocketInstance.chatRoomId !== chatRoomId) {
    if (webSocketInstance) {
      webSocketInstance.disconnect();
    }
    webSocketInstance = new WebSocketService(role, url, token, chatRoomId);
  }
  return webSocketInstance;
};

export class WebSocketService {
  constructor(role, wsBaseUrl, token, chatRoomId) {
    this.role = role;
    this.wsBaseUrl = wsBaseUrl;
    this.token = token;
    this.chatRoomId = chatRoomId;
    this.ws = null;
    this.onMessage = null;
    this.onTyping = null;
    this.onStatusChange = null;
  }

  connect() {
    const url = `${this.wsBaseUrl}?token=${this.token}&roomId=${this.chatRoomId}&role=${this.role}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this._notifyStatus('Connected');
    this.ws.onclose = () => this._notifyStatus('Disconnected');
    this.ws.onerror = (e) => {
      console.error(`[${this.role}] WebSocket error`, e);
      this._notifyStatus('Error');
    };
    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'typing') this.onTyping?.(msg);
        else this.onMessage?.(msg);
      } catch (err) {
        console.error(`[${this.role}] Failed to parse message`, err);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content, { onSuccess } = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ type: 'message', content });
      this.ws.send(payload);
      onSuccess?.({ content, sender: { name: 'Admin' } });
    }
  }

  sendTypingIndicator(isTyping) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ type: 'typing', isTyping });
      this.ws.send(payload);
    }
  }

  _notifyStatus(status) {
    this.onStatusChange?.(status);
  }
}

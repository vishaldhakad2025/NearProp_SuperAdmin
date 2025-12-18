// websocket.js
import { Client } from '@stomp/stompjs';
import {
  addMessage,
  updateTypingStatus,
  updateMessageStatus,
  updateUnreadCount,
  setConnected,
} from '../../redux/slices/chatSlice';

let stompClient = null;
let currentSubscription = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const initialReconnectDelay = 1000;

const subscribeToRoom = (roomId, dispatch) => {
  if (!stompClient || !stompClient.connected || !roomId) {
    console.warn('Cannot subscribe: WebSocket not connected or roomId missing', { roomId });
    return;
  }

  if (currentSubscription) {
    currentSubscription.unsubscribe();
    console.log('🔁 Unsubscribed from previous room');
  }

  currentSubscription = stompClient.subscribe(`/topic/chat/${roomId}`, (msg) => {
    try {
      const data = JSON.parse(msg.body);
      const messageRoomId = data.chatRoomId || data.roomId || roomId;

      switch (data.type) {
        case 'MESSAGE':
          dispatch(
            addMessage({
              roomId: messageRoomId,
              message: {
                id: data.id,
                content: data.content,
                type: data.sender?.id === data.userId ? 'outgoing' : 'incoming',
                status: data.status || 'SENT',
                sender: data.sender || {
                  id: data.userId,
                  name: data.userName || `User ${data.userId}`,
                },
                createdAt: data.createdAt || new Date().toISOString(),
              },
            })
          );
          if (!data.mine) {
            const messageSound = new Audio('/message-notification.mp3');
            messageSound.play().catch((err) => console.error('Sound play error:', err));
          }
          break;

        case 'TYPING':
        case 'STOP_TYPING':
          dispatch(
            updateTypingStatus({
              roomId: messageRoomId,
              userId: data.userId,
              userName: data.userName || `User ${data.userId}`,
              avatar: data.avatar || '/assets/default-avatar.png',
              isTyping: data.type === 'TYPING',
            })
          );
          break;

        case 'STATUS_UPDATE':
          dispatch(
            updateMessageStatus({
              roomId: messageRoomId,
              messageId: data.messageId,
              status: data.status,
            })
          );
          if (data.status === 'READ') {
            dispatch(updateUnreadCount({ roomId: messageRoomId, count: 0 }));
          }
          break;

        default:
          console.warn('Unknown WebSocket type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket parse error:', error);
    }
  });

  console.log(`✅ Subscribed to /topic/chat/${roomId}`);
};

export const initWebSocket = (token, dispatch, roomId) => {
  if (stompClient && stompClient.connected) {
    if (roomId) subscribeToRoom(roomId, dispatch);
    return;
  }

  stompClient = new Client({
    brokerURL: `wss://api.nearprop.com/api/ws?token=${token}`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: (str) => console.log("[STOMP]", str),
    reconnectDelay: 3000, // let STOMP auto-reconnect every 3s
    heartbeatIncoming: 8000,
    heartbeatOutgoing: 8000,

    onConnect: () => {
      console.log("🟢 WebSocket connected");
      dispatch(setConnected(true));
      if (roomId) subscribeToRoom(roomId, dispatch);
    },

    onDisconnect: () => {
      console.warn("🔌 WebSocket disconnected");
      dispatch(setConnected(false));
      currentSubscription = null;
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
      dispatch(setConnected(false));
    },

    onWebSocketError: (evt) => {
      console.error("❌ WebSocket error:", evt);
      dispatch(setConnected(false));
    },
  });

  stompClient.activate();
};


export const reconnectWebSocket = (token, dispatch, roomId) => {
  console.log('♻️ Reconnecting WebSocket...');
  reconnectAttempts = 0;
  if (stompClient) closeWebSocket();
  initWebSocket(token, dispatch, roomId);
};

export const sendMessageToSocket = ({ destination, body, headers }) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({ destination, body, headers });
  } else {
    console.warn('⚠️ Cannot send message: WebSocket not connected');
  }
};

export const sendTypingEvent = ({ destination, body, headers }) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({ destination, body, headers });
  } else {
    console.warn('⚠️ Cannot send typing event: WebSocket not connected');
  }
};

export const closeWebSocket = () => {
  if (stompClient) {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
    }
    stompClient.deactivate();
    stompClient = null;
    console.log('🛑 WebSocket closed');
  }
};

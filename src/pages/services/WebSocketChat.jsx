import React, { useEffect, useRef, useState } from 'react';

const WebSocketChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const token = localStorage.getItem('token');
  const WS_URL = `ws://13.126.35.188:8080/api/ws?token=${token}`; 

  useEffect(() => {
    if (!token) {
      console.warn('No token found in localStorage.');
      return;
    }

    // Prevent duplicate connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    socketRef.current = new WebSocket(WS_URL);
const socket = new WebSocket(WS_URL);
console.log("socket success response : ", socket)
    socketRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error('Invalid message format:', event.data);
      }
    };

    socketRef.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    };

    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [token, WS_URL]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messagePayload = {
      type: 'MESSAGE',
      content: input,
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
      setInput('');
    } else {
      alert('WebSocket not connected.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Chat {isConnected ? '🟢' : '🔴'}</h2>

      <div style={{ border: '1px solid #ddd', padding: 10, height: 300, overflowY: 'auto' }}>
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.sender?.name || 'User'}:</strong> {msg.content}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          style={{ width: '80%', marginRight: 10 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
};

export default WebSocketChat;

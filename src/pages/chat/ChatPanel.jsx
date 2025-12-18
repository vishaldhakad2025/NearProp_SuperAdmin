import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, Button, Input, Spin, message, Tooltip } from 'antd';
import { SendOutlined, ArrowLeftOutlined, CheckOutlined, DoubleRightOutlined, CloseOutlined } from '@ant-design/icons';
import { gsap } from 'gsap';
import {
  setActiveRoom,
  setRooms,
  addMessage,
  clearMessages,
  updateTypingStatus,
  updateMessageStatus,
  updateUnreadCount,
  closeChatRoom,
} from '../../redux/slices/chatSlice';
import { fetchUserProfile } from '../../redux/slices/authSlice';
import { initWebSocket, sendTypingEvent, closeWebSocket } from './websocketService';
import './ChatPanel.css';
import 'antd/dist/reset.css';
import { Eye } from 'lucide-react';


const BASE_URL = 'https://api.nearprop.com';
const API_PREFIX = 'api';

const ChatPanel = () => {
  const dispatch = useDispatch();
  const { rooms, activeRoom, messages, isConnected, typingUsers } = useSelector((state) => state.chat);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const userId = user?.id;
  const userName = user?.name || 'User';
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  
  const currentTypingUsers = typingUsers[activeRoom?.id] || [];
  // console.log("--------------------------------------",typingUsers)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom]);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
      initWebSocket(token, dispatch, activeRoom?.id);
      fetchRooms();
    }
    return () => closeWebSocket();
  }, [token, dispatch]);

  useEffect(() => {
    if (activeRoom) {
      localStorage.setItem('lastActiveRoomId', activeRoom.id);
      fetchMessages(activeRoom.id);
      initWebSocket(token, dispatch, activeRoom.id);
    }
  }, [activeRoom, token, dispatch]);

  useEffect(() => {
    // GSAP animations
    gsap.utils.toArray('.chat-item').forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 }
      );
      item.addEventListener('mouseenter', () => {
        gsap.to(item, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(item, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    gsap.utils.toArray('.message').forEach((msg) => {
      gsap.from(msg, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out' });
    });

    if (showChatWindow && chatWindowRef.current) {
      gsap.fromTo(
        chatWindowRef.current,
        { x: '100%', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [showChatWindow, rooms, messages]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const endpoint = `${BASE_URL}/${API_PREFIX}/chat/admin/rooms`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      const formattedRooms = data?.map((room) => ({
        id: room.id,
        name: room.buyer?.name || room.title || `Room ${room.id}`,
        avatar: room.buyer?.avatar || '/assets/default-avatar.png',
        propertyId: room.property?.id,
        propertyTitle: room.property?.title || '-',
        district: room.property?.district || '-',
        thumbnail: room.property?.thumbnail || '/assets/default-property.png',
        unreadCount: room.unreadCount || 0,
        status: room.status || 'OPEN',
      })) || [];

      dispatch(setRooms(formattedRooms.filter((room) => room.status === 'OPEN')));

      const lastActiveRoomId = localStorage.getItem('lastActiveRoomId');
      if (lastActiveRoomId) {
        const lastActiveRoom = formattedRooms.find((room) => room.id === parseInt(lastActiveRoomId) && room.status === 'OPEN');
        if (lastActiveRoom) {
          dispatch(setActiveRoom(lastActiveRoom));
          setShowChatWindow(true);
        }
      }
    } catch (err) {
      message.error(`Failed to fetch chat rooms: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

const fetchMessages = async (roomId) => {
  try {
    setIsLoading(true);
    dispatch(clearMessages(roomId));

    const response = await fetch(
      `${BASE_URL}/${API_PREFIX}/chat/admin/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const allMessages = await response.json();

    // ✅ Filter only messages of the selected room
    const roomMessages = allMessages.filter(
      (msg) => String(msg.chatRoomId) === String(roomId)
    );

    // ✅ Sort messages chronologically
    roomMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // ✅ Process each message
    roomMessages.forEach((msg) => {
      const isMine = msg.sender?.id === userId;

      dispatch(
        addMessage({
          roomId,
          message: {
            id: msg.id,
            content: msg.content,
            type: isMine ? "outgoing" : "incoming",
            status: msg.status || "SENT",
            sender: msg.sender || { id: userId, name: userName },
            createdAt: msg.createdAt || new Date().toISOString(),
          },
        })
      );

      // ✅ Mark incoming messages as read if not already
      if (!isMine && msg.status !== "READ") {
        markMessageAsRead(msg.id, roomId);
      }
    });
  } catch (err) {
    message.error(`Failed to fetch messages: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};



  const sendMessage = async () => {
    if (!inputText.trim() || !activeRoom || !isConnected) {
      message.warning('Cannot send message: No active room or WebSocket disconnected');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const optimisticMessage = {
      id: tempId,
      content: inputText,
      type: 'outgoing',
      status: 'SENT',
      sender: { id: userId, name: userName },
      createdAt,
    };

    dispatch(addMessage({ roomId: activeRoom.id, message: optimisticMessage }));
    setInputText('');

    try {
      const response = await fetch(`${BASE_URL}/${API_PREFIX}/chat/admin/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputText,
          parentMessageId: null,
          adminMessage:true,
          mine:true
        }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const newMessage = await response.json();

      dispatch(
        updateMessageStatus({
          roomId: activeRoom.id,
          messageId: tempId,
          status: newMessage.status || 'SENT',
          updatedMessage: {
            id: newMessage.id,
            content: newMessage.content,
            type: 'outgoing',
            status: newMessage.status || 'SENT',
            sender: { id: userId, name: userName },
            createdAt: newMessage.createdAt || createdAt,
          },
        })
      );

    } catch (err) {
      message.error(`Failed to send message: ${err.message}`);
      dispatch(clearMessages(activeRoom.id));
      fetchMessages(activeRoom.id);
    }
  };

  const markMessageAsRead = async (messageId, roomId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/${API_PREFIX}/chat/messages/${messageId}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'READ' }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      dispatch(
        updateMessageStatus({
          roomId,
          messageId,
          status: 'READ',
        })
      );
      dispatch(updateUnreadCount({ roomId, count: 0 }));
      fetchRooms();
    } catch (err) {
      message.error(`Failed to mark message as read: ${err.message}`);
    }
  };

  // const closeChat = async () => {
  //   if (!activeRoom) return;
  //   try {
  //     const response = await fetch(`${BASE_URL}/${API_PREFIX}/chat/rooms/${activeRoom.id}/status`, {
  //       method: 'PATCH',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ status: 'CLOSED' }),
  //     });
  //     if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  //     dispatch(closeChatRoom(activeRoom.id));
  //     setShowChatWindow(false);
  //     dispatch(setActiveRoom(null));
  //     localStorage.removeItem('lastActiveRoomId');
  //     message.success('Chat room closed successfully');
  //     fetchRooms();
  //   } catch (err) {
  //     message.error(`Failed to close chat room: ${err.message}`);
  //   }
  // };

  
  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (activeRoom && isConnected) {
      sendTypingEvent({
        destination: `/app/chat/${activeRoom.id}/typing`,
        body: JSON.stringify({
          type: 'TYPING',
          roomId: activeRoom.id,
          userId,
          userName,
        }),
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(
        setTimeout(() => {
          sendTypingEvent({
            destination: `/app/chat/${activeRoom.id}/typing`,
            body: JSON.stringify({
              type: 'STOP_TYPING',
              roomId: activeRoom.id,
              userId,
              userName,
            }),
            headers: { Authorization: `Bearer ${token}` },
          });
        }, 2000)
      );
    }
  };

  const handleChatSelect = (chat) => {
    dispatch(setActiveRoom(chat));
    setShowChatWindow(true);
  };

  const handleBack = () => {
    setShowChatWindow(false);
    dispatch(setActiveRoom(null));
    localStorage.removeItem('lastActiveRoomId');
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <Spin spinning={isLoading || authLoading}>
        <header className="bg-cyan-800 text-white p-4 flex justify-between items-center shadow-lg">
          <h1 className="text-xl font-bold">NearProp Chat</h1>
          {user && (
            <div className="flex items-center gap-3">
              <Avatar src={user.profileImageUrl || '/assets/default-avatar.png'} size={40} />
              <span className="font-semibold">{user.name}</span>
            </div>
          )}
        </header>
        <div className="flex flex-1 h-[calc(100vh-64px)]">
          <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search by name or district"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-1 ">

              {filteredRooms.length === 0 && <div className="p-4 text-gray-500 text-center">No chats found</div>}
              {filteredRooms.map((chat) => (
                <Tooltip key={chat.id} title={`Property: ${chat.propertyTitle}`} placement="right">
                  <div
                    className={`chat-item flex items-center p-4 gap-2 border-b border-gray-100 cursor-pointer hover:bg-cyan-50 ${activeRoom?.id === chat.id ? 'bg-cyan-100' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <Avatar src={chat.thumbnail} size={48} className="mr-3" />
                    <div className="flex-1 gap-1">
                      <div className="flex justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-800">{chat.name}</div>
                          <div className="text-sm text-gray-500">{chat.district}</div>
                          <div className="text-sm text-green-500">{chat.propertyTitle}</div>
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="bg-cyan-600 text-white text-xs font-medium rounded-full px-2 py-1">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {(messages[chat.id]?.slice(-1)[0]?.content || 'No messages yet')}
                      </div>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
          <div
            ref={chatWindowRef}
            className={`flex-1 flex flex-col bg-gray-50 ${showChatWindow ? 'flex' : 'hidden md:flex'}`}
          >
            {activeRoom ? (
              <>
                <div className="flex items-center p-4 bg-white border-b border-gray-200">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="md:hidden mr-3"
                  />
                  <Avatar src={activeRoom.thumbnail} size={40} />
                  <div className="ml-3">
                    <div className="font-semibold text-cyan-800">{activeRoom.name}</div>
                    <div className="text-sm text-gray-500">{activeRoom.district}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Link to={`/dashboard/properties/${activeRoom.propertyId}`} className="text-sm px-2 flex gap-1 items-center  text-cyan-600 animate-pulse hover:underline">
                    View Property
                    </Link>
                    {/* <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={closeChat}
                      className="text-red-500"
                    >
                      Close Chat
                    </Button> */}

                    <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      {isConnected ? '' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
                
                  {(messages[activeRoom.id] || []).map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`message max-w-[70%] p-3 rounded-lg shadow-sm ${msg.type == 'outgoing' ? 'bg-cyan-100 self-end' : 'bg-white self-start'}`}
                      onClick={() => !msg.mine && msg.status !== 'READ' && markMessageAsRead(msg.id, activeRoom.id)}
                    >
                      <div className="text-sm font-semibold text-gray-800">{msg.sender?.name || 'Unknown'}</div>
                      <div className="text-gray-700">{msg.content}</div>
                      <div className="flex justify-end items-center gap-2 mt-1">
                        <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
                        {msg.type === 'outgoing' && (
                          <div className="text-xs">
                            {msg.status === 'SENT' && <DoubleRightOutlined className="text-gray-500" />}
                            {msg.status === 'DELIVERED' && <DoubleRightOutlined className="text-gray-800" />}
                            {msg.status === 'READ' && <DoubleRightOutlined className="text-blue-500" />}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                 
                  {currentTypingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      {currentTypingUsers.map((user) => (
                        <div key={user.userId} className="flex items-center gap-1">
                          <Avatar src={user.avatar || '/assets/default-avatar.png'} size={24} />
                          <span>{user.userName}</span>
                        </div>
                      ))}
                      <span>is typing</span>
                      <span className="typing-dots">...</span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                  <Input
                    placeholder="Type a message"
                    value={inputText}
                    onChange={handleTyping}
                    onPressEnter={sendMessage}
                    disabled={!isConnected}
                    className="rounded-lg py-0.5"
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    disabled={!isConnected || !inputText.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a chat room
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ChatPanel;
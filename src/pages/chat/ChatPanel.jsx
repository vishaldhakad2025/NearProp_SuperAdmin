import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, Button, Input, Spin, message, Tooltip, Tag, Badge } from 'antd';
import { SendOutlined, ArrowLeftOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { gsap } from 'gsap';
import {
  setActiveRoom,
  setRooms,
  addMessage,
  clearMessages,
  updateTypingStatus,
  updateMessageStatus,
  updateUnreadCount,
} from '../../redux/slices/chatSlice';
import { fetchUserProfile } from '../../redux/slices/authSlice';
import { initWebSocket, closeWebSocket } from './websocketService';
import './ChatPanel.css';
import 'antd/dist/reset.css';
import { toast } from 'react-toastify';

const BASE_URL = 'https://api.nearprop.com';
const API_PREFIX = 'api';

const ChatPanel = () => {
  const dispatch = useDispatch();
  const { rooms, activeRoom, messages, isConnected } = useSelector((state) => state.chat);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const userId = user?.id;
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

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
    gsap.utils.toArray('.chat-item').forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.05 }
      );
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
        participants: room.participants || [],
      })) || [];

      dispatch(setRooms(formattedRooms.filter((room) => room.status === 'OPEN')));

      const lastActiveRoomId = localStorage.getItem('lastActiveRoomId');
      if (lastActiveRoomId) {
        const lastActiveRoom = formattedRooms.find(
          (room) => room.id === parseInt(lastActiveRoomId) && room.status === 'OPEN'
        );
        if (lastActiveRoom) {
          dispatch(setActiveRoom(lastActiveRoom));
          setShowChatWindow(true);
        }
      }
    } catch (err) {
      message.error(`Failed to fetch chat rooms: ${err.message}`);
      toast.error("Failed to Fetch chat panel")
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

      // Filter messages for the selected room
      const roomMessages = allMessages.filter(
        (msg) => String(msg.chatRoomId) === String(roomId)
      );

      // Sort messages chronologically
      roomMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Process each message
      roomMessages.forEach((msg) => {
        const isAdminMessage = msg.adminMessage === true;
        const isMine = msg.mine === true;

        dispatch(
          addMessage({
            roomId,
            message: {
              id: msg.id,
              content: msg.content,
              sender: msg.sender || { id: 'unknown', name: 'Unknown' },
              createdAt: msg.createdAt || new Date().toISOString(),
              status: msg.status || 'SENT',
              readAt: msg.readAt,
              adminMessage: isAdminMessage,
              mine: isMine,
            },
          })
        );
      });
    } catch (err) {
      message.error(`Failed to fetch messages: ${err.message}`);
    } finally {
      setIsLoading(false);
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
      room.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get participant names for active room
  const getParticipantNames = (roomMessages) => {
    if (!roomMessages || roomMessages.length === 0) return [];
    const participants = new Set();
    roomMessages.forEach((msg) => {
      if (msg.sender && msg.sender.name) {
        participants.add(msg.sender.name);
      }
    });
    return Array.from(participants);
  };

  const activeRoomMessages = messages[activeRoom?.id] || [];
  const participantNames = getParticipantNames(activeRoomMessages);

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <Spin spinning={isLoading || authLoading}>
        <header className="bg-cyan-800 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">NearProp Admin Chat Viewer</h1>
            <Tag color="gold" className="text-xs">View Only</Tag>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <Avatar src={user.profileImageUrl || '/assets/default-avatar.png'} size={40} />
              <span className="font-semibold">{user.name}</span>
            </div>
          )}
        </header>
        <div className="flex flex-1 h-[calc(100vh-64px)]">
          {/* Sidebar - Chat Rooms List */}
          <div
            className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${showChatWindow ? 'hidden md:flex' : 'flex'
              }`}
          >
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search by name, district, or property"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {filteredRooms.length === 0 && (
                <div className="p-4 text-gray-500 text-center">No chats found</div>
              )}
              {filteredRooms.map((chat) => (
                <Tooltip key={chat.id} title={`Property: ${chat.propertyTitle}`} placement="right">
                  <div
                    className={`chat-item flex items-center p-4 gap-2 border-b border-gray-100 cursor-pointer hover:bg-cyan-50 transition-colors ${activeRoom?.id === chat.id ? 'bg-cyan-100' : ''
                      }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <Avatar src={chat.thumbnail} size={48} className="mr-3" />
                    <div className="flex-1 gap-1">
                      <div className="flex justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{chat.name}</div>
                          <div className="text-sm text-gray-500">{chat.district}</div>
                          <div className="text-xs text-green-600 truncate">{chat.propertyTitle}</div>
                        </div>
                        {chat.unreadCount > 0 && (
                          <Badge count={chat.unreadCount} className="ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Main Chat Window */}
          <div
            ref={chatWindowRef}
            className={`flex-1 flex flex-col bg-gray-50 ${showChatWindow ? 'flex' : 'hidden md:flex'}`}
          >
            {activeRoom ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="md:hidden mr-3"
                  />
                  <Avatar src={activeRoom.thumbnail} size={48} />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-cyan-800 text-lg">{activeRoom.name}</div>
                    <div className="text-sm text-gray-500">{activeRoom.district}</div>
                    <div className="text-xs text-gray-400">
                      Property: {activeRoom.propertyTitle}
                    </div>
                    {participantNames.length > 0 && (
                      <div className="text-xs text-purple-600 mt-1">
                        Participants: {participantNames.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <Link
                      to={`/dashboard/properties/${activeRoom.propertyId}`}
                      className="text-sm px-3 py-1 flex gap-1 items-center text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <EyeOutlined />
                      View Property
                    </Link>
                    <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      {isConnected ? '● Connected' : '● Disconnected'}
                    </span>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3 bg-gradient-to-b from-gray-50 to-gray-100">
                  {activeRoomMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      No messages in this conversation yet
                    </div>
                  ) : (
                    activeRoomMessages.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className="message flex items-start gap-3"
                      >
                        <Avatar
                          src={msg.sender?.avatar}
                          icon={<UserOutlined />}
                          size={36}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {msg.sender?.name || 'Unknown User'}
                            </span>
                            {msg.adminMessage && (
                              <Tag color="red" className="text-xs">
                                Admin
                              </Tag>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-[70%]">
                            <div className="text-gray-700">{msg.content}</div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <span>Status: {msg.status}</span>
                              {msg.readAt && (
                                <span>
                                  Read at:{' '}
                                  {new Date(msg.readAt).toLocaleString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Admin View Notice */}
                <div className="p-4 bg-amber-50 border-t border-amber-200">
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <EyeOutlined />
                    <span className="text-sm font-medium">
                      You are viewing this conversation as an admin. Users cannot see this panel.
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div className="text-lg font-medium">Select a chat room to view conversation</div>
                <div className="text-sm mt-2">Admin View Mode - Read Only</div>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ChatPanel;
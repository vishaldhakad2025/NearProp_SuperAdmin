import { createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchChatRooms = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/api/chat/admin/rooms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const formattedRooms = response.data.content?.map((room) => ({
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
  } catch (err) {
    console.error('Failed to fetch chat rooms:', err);
  }
};

export const selectRoomByPropertyId = (state, propertyId) =>
  state.chat.rooms.find((room) => room.propertyId === propertyId);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    activeRoom: null,
    messages: {},
    isConnected: false,
    typingUsers: {},
  },
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    addMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) state.messages[roomId] = [];
      if (!state.messages[roomId].some((m) => m.id === message.id || m.id === `temp-${message.id}`)) {
        state.messages[roomId].push(message);
      }
    },
    clearMessages: (state, action) => {
      const roomId = action.payload;
      state.messages[roomId] = [];
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    updateTypingStatus: (state, action) => {
      const { roomId, userId, userName, isTyping, avatar } = action.payload;
      console.log("isTyping ----", isTyping)
      if (!state.typingUsers[roomId]) state.typingUsers[roomId] = [];
      if (isTyping) {
        if (!state.typingUsers[roomId].some((user) => user.userId === userId)) {
          state.typingUsers[roomId].push({ userId, userName, avatar });
        }
      } else {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter((user) => user.userId !== userId);
      }
    },
    updateMessageStatus: (state, action) => {
      const { roomId, messageId, status, updatedMessage } = action.payload;
      if (state.messages[roomId]) {
        const index = state.messages[roomId].findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
          if (updatedMessage) {
            state.messages[roomId][index] = updatedMessage;
          } else {
            state.messages[roomId][index].status = status;
          }
        }
      }
    },
    updateUnreadCount: (state, action) => {
      const { roomId, count } = action.payload;
      const room = state.rooms.find((r) => r.id === roomId);
      if (room) room.unreadCount = count;
    },
    closeChatRoom: (state, action) => {
      const roomId = action.payload;
      state.rooms = state.rooms.filter((room) => room.id !== roomId);
      if (state.activeRoom?.id === roomId) {
        state.activeRoom = null;
      }
    },
  },
});

export const {
  setRooms,
  setActiveRoom,
  addMessage,
  clearMessages,
  setConnected,
  updateTypingStatus,
  updateMessageStatus,
  updateUnreadCount,
  closeChatRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
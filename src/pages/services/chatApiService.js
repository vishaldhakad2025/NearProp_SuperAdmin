// src/services/chatApiService.js
import axiosInstance from '../utils/axiosInstance';

export const chatApi = {
  getChatRooms: (role, token) => {
    return axiosInstance.get(`/api/chat/rooms/${role}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getMessages: (roomId, token) => {
    return axiosInstance.get(`/api/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  sendMessage: (roomId, content, token) => {
    return axiosInstance.post(
      `/api/chat/rooms/${roomId}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

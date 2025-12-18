// src/hooks/useChat.js
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setTypingUsers } from '../features/chat/chatSlice';

export const useChat = (role) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat[role]?.messages || []);
  const typingUsers = useSelector((state) => state.chat[role]?.typingUsers || []);

  const sendLocalMessage = (msg) => dispatch(addMessage({ role, message: msg }));
  const updateTyping = (users) => dispatch(setTypingUsers({ role, users }));

  return { messages, typingUsers, sendLocalMessage, updateTyping };
};

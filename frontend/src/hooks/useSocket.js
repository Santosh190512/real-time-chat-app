import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateChatFromMessage } from "../redux/chat/chatSlice";
import {
  addRealtimeMessage,
  addTypingUser,
  clearTypingUsers,
  updateMessageStatus,
} from "../redux/message/messageSlice";
import { storage } from "../utils/storage";

export default function useSocket(roomId) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const getWebSocketBaseUrl = () => {
    if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).host
      : window.location.host;
    return `${protocol}://${host}/ws`;
  };

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!roomId || !token) {
      return undefined;
    }

    let closedByCleanup = false;
    const connect = () => {
      const socket = new WebSocket(`${getWebSocketBaseUrl()}/chat/${roomId}/?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.info("WebSocket connected", roomId);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error", error);
      };

      socket.onclose = (event) => {
        console.warn("WebSocket closed", { roomId, code: event.code, reason: event.reason });
        if (!closedByCleanup && event.code !== 4001 && event.code !== 4003) {
          reconnectTimerRef.current = window.setTimeout(connect, 1200);
        }
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "typing":
            dispatch(addTypingUser(data.username));
            window.setTimeout(() => dispatch(clearTypingUsers()), 1500);
            break;
          case "message_seen":
            dispatch(updateMessageStatus({ id: data.message_id, status: "seen" }));
            break;
          case "message_delivered":
            dispatch(updateMessageStatus({ id: data.message_id, status: "delivered" }));
            break;
          default:
            dispatch(addRealtimeMessage(data));
            dispatch(updateChatFromMessage(data));
            if (user?.id && Number(data.sender) !== Number(user.id) && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "delivered_receipt", message_id: data.id }));
            }
            break;
        }
      };
    };

    connect();

    return () => {
      closedByCleanup = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
  }, [roomId, dispatch, user?.id]);

  const sendSocketMessage = (content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "chat_message", content }));
      return true;
    }
    return false;
  };

  const sendTyping = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  const sendReadReceipt = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "read_receipt", message_id: messageId }));
    }
  };

  return { sendReadReceipt, sendSocketMessage, sendTyping };
}

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Info, Phone, Send, Smile, Video } from "lucide-react";

import useSocket from "../../hooks/useSocket";
import { fetchMessagesThunk, sendMessageThunk } from "../../redux/message/messageThunk";
import MessageBubble from "../MessageBubble/MessageBubble";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import UploadButton from "../UploadButton/UploadButton";
import { getRoomTitle } from "../../utils/chatDisplay";

export default function ChatWindow({ room, onToggleInfo }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, typingUsers } = useSelector((state) => state.message);
  const [text, setText] = useState("");
  const { sendReadReceipt, sendSocketMessage, sendTyping } = useSocket(room?.id);
  const roomTitle = getRoomTitle(room, user?.id);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (room?.id) {
      dispatch(fetchMessagesThunk(room.id));
    }
  }, [dispatch, room?.id]);

  useEffect(() => {
    if (!user?.id) return;
    messages.forEach((message) => {
      if (Number(message.sender) !== Number(user.id) && message.status !== "seen") {
        sendReadReceipt(message.id);
      }
    });
  }, [messages, sendReadReceipt, user?.id]);

  if (!room) {
    return (
      <section className="flex min-w-0 items-center justify-center bg-slate-950 px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-black text-blue-400">C</div>
          <h2 className="m-0 text-3xl font-semibold text-white">Select a conversation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Choose a chat from the sidebar to start messaging.</p>
        </div>
      </section>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    const sentOverSocket = sendSocketMessage(content);
    if (!sentOverSocket) {
      dispatch(sendMessageThunk({ conversationId: room.id, data: { content } }));
    }
    setText("");
  };

  return (
    <section className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-slate-950">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
            {roomTitle?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-base font-semibold text-white">{roomTitle}</h2>
            <p className="m-0 truncate text-sm text-green-400">{room.room_type === "group" ? `${room.participants?.length || 0} members` : "Online"}</p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-300">
          <Phone className="h-5 w-5 cursor-pointer hover:text-white" />
          <Video className="h-5 w-5 cursor-pointer hover:text-white" />
          <Info className="h-5 w-5 cursor-pointer hover:text-white xl:hidden" onClick={onToggleInfo} />
        </div>
      </header>

      <div className="min-h-0 overflow-y-auto bg-slate-950 p-6">
        <div className="flex min-h-full flex-col justify-end gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} own={message.sender === user?.id} />
        ))}
        <TypingIndicator users={typingUsers.filter((name) => name !== user?.username)} />
        <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="shrink-0 border-t border-slate-800 bg-slate-900 px-5 py-4 pb-6 md:pb-4" onSubmit={handleSend}>
        <div className="flex items-center gap-3">
          <Smile className="h-5 w-5 shrink-0 text-slate-400" />
        <UploadButton roomId={room.id} />
        <input
          className="min-w-0 flex-1 rounded-full border-0 bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping();
          }}
          placeholder="Write a message"
        />
          <button type="submit" className="cursor-pointer rounded-full bg-blue-600 p-3 text-white transition hover:bg-blue-500">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </section>
  );
}

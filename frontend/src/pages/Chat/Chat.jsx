import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatWindow from "../../components/ChatWindow/ChatWindow";
import CreateGroupModal from "../../components/CreateGroupModal/CreateGroupModal";
import GroupInfoPanel from "../../components/GroupInfoPanel/GroupInfoPanel";
import Sidebar from "../../components/Sidebar/Sidebar";
import { fetchChatsThunk } from "../../redux/chat/chatThunk";
import { setActiveChat } from "../../redux/chat/chatSlice";
import { clearMessages } from "../../redux/message/messageSlice";

export default function Chat() {
  const dispatch = useDispatch();
  const { activeChat, chats } = useSelector((state) => state.chat);
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    dispatch(fetchChatsThunk());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      dispatch(fetchChatsThunk());
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  const handleSelectRoom = (room) => {
    dispatch(clearMessages());
    dispatch(setActiveChat(room));
  };

  return (
    <div className="grid h-dvh grid-cols-[320px_minmax(0,1fr)_320px] overflow-hidden bg-slate-950 text-white max-xl:grid-cols-[320px_minmax(0,1fr)] max-md:grid-cols-1">
      <Sidebar
        rooms={chats}
        activeRoomId={activeChat?.id}
        onSelect={handleSelectRoom}
        onCreateGroup={() => setShowModal(true)}
      />

      <ChatWindow room={activeChat} onToggleInfo={() => setShowInfo((value) => !value)} />

      {showInfo && activeChat && <GroupInfoPanel room={activeChat} onClose={() => setShowInfo(false)} />}

      {showModal && <CreateGroupModal closeModal={() => setShowModal(false)} />}
    </div>
  );
}

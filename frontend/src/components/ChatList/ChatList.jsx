import { useSelector } from "react-redux";

export default function ChatList({ rooms, activeRoomId, onSelect }) {
  const { user } = useSelector((state) => state.auth);
  const getRoomTitle = (room) => {
    if (room.name) return room.name;
    const other = room.participants?.find((member) => member.user_id !== user?.id);
    return other?.name || other?.phone_number || other?.username || `Room ${room.id}`;
  };

  return (
    <div className="grid overflow-auto bg-white">
      {rooms.map((room) => (
        <button
          type="button"
          key={room.id}
          className={`grid cursor-pointer grid-cols-[49px_1fr] items-center gap-3 border-0 border-b border-[#f0f2f5] px-4 py-3 text-left transition ${
            activeRoomId === room.id ? "bg-[#f0f2f5]" : "bg-white hover:bg-[#f5f6f6]"
          }`}
          onClick={() => onSelect(room)}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe5e7] text-base font-semibold text-[#54656f]">
            {getRoomTitle(room)?.[0]?.toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-medium text-[#111b21]">{getRoomTitle(room)}</span>
            <span className="block truncate text-sm text-[#667781]">{room.last_message?.content || "No messages yet"}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

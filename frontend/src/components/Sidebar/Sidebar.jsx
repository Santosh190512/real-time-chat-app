import { Bell, MessageCircle, Search, Users } from "lucide-react";
import { useSelector } from "react-redux";

import { getRoomInitial, getRoomTitle } from "../../utils/chatDisplay";

export default function Sidebar({ rooms = [], activeRoomId, onSelect, onCreateGroup }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <aside className="flex min-h-0 w-80 flex-col border-r border-slate-800 bg-slate-900 max-md:hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Messages</p>
            <h1 className="m-0 text-2xl font-bold text-white">Chats</h1>
          </div>
          <button
            type="button"
            onClick={onCreateGroup}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            New
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 pl-10 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            type="button"
            key={room.id}
            onClick={() => onSelect(room)}
            className={`grid w-full cursor-pointer grid-cols-[48px_1fr] items-center gap-3 border-0 px-4 py-3 text-left transition ${
              activeRoomId === room.id ? "bg-slate-800" : "bg-transparent hover:bg-slate-800/70"
            }`}
          >
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white">
                {getRoomInitial(room, user?.id)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
            </div>

            <div className="min-w-0">
              <h3 className="m-0 truncate text-[15px] font-medium text-white">{getRoomTitle(room, user?.id)}</h3>
              <p className="m-0 truncate text-sm text-slate-400">{room.last_message?.content || "No messages yet"}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-around border-t border-slate-800 p-4">
        <MessageCircle className="text-white" />
        <Users className="text-slate-400" />
        <Bell className="text-slate-400" />
      </div>
    </aside>
  );
}

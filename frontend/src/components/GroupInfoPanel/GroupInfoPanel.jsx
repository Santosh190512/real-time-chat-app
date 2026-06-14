import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { addMemberThunk, leaveGroupThunk, removeMemberThunk } from "../../redux/chat/chatThunk";
import { getRoomTitle } from "../../utils/chatDisplay";

export default function GroupInfoPanel({ room }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [userId, setUserId] = useState("");

  if (!room) return null;

  const handleAdd = () => {
    if (userId) {
      dispatch(addMemberThunk({ roomId: room.id, userId }));
      setUserId("");
    }
  };

  return (
    <aside className="hidden w-80 overflow-auto border-l border-slate-800 bg-slate-900 xl:block">
      <div className="p-6 text-center">
      <div className="mx-auto flex aspect-square w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-extrabold text-white">
        {room.avatar ? <img src={room.avatar} alt="" className="h-full w-full object-cover" /> : <span>{room.name?.[0] || "G"}</span>}
      </div>
      <h2 className="m-0 mt-4 text-xl font-semibold text-white">{getRoomTitle(room, user?.id)}</h2>
      <p className="mt-1 text-slate-400">{room.room_type === "group" ? "Group chat" : "Private chat"}</p>

      <div className="mt-8 text-left">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Shared Media</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-20 rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>

      {room.room_type === "group" && (
        <div className="my-[18px] grid grid-cols-[1fr_auto] gap-2">
          <input
            className="w-full rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID to add"
          />
          <button type="button" onClick={handleAdd} className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-500">
            Add
          </button>
        </div>
      )}

      <div className="mt-[18px] grid gap-2 text-left">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-500">Members</h3>
        {room.participants?.map((member) => (
          <div key={member.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-slate-800 py-2">
            <span className="text-white">{member.username}</span>
            <strong className="text-xs uppercase text-blue-400">{member.role}</strong>
            {room.room_type === "group" && (
              <button
                type="button"
                className="bg-transparent p-1 text-red-400"
                onClick={() => dispatch(removeMemberThunk({ roomId: room.id, userId: member.user_id }))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {room.room_type === "group" && (
        <button type="button" className="mt-[18px] w-full cursor-pointer rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-500" onClick={() => dispatch(leaveGroupThunk(room.id))}>
          Leave Group
        </button>
      )}
      </div>
    </aside>
  );
}

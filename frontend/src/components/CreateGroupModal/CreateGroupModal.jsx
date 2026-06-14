import { useState } from "react";
import { useDispatch } from "react-redux";

import { createGroupThunk } from "../../redux/chat/chatThunk";

export default function CreateGroupModal({ closeModal }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const payload = new FormData();
    payload.append("name", name);
    payload.append("room_type", "group");
    if (avatar) {
      payload.append("avatar", avatar);
    }

    await dispatch(createGroupThunk(payload));
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/45 p-[18px] backdrop-blur-sm">
      <div className="grid w-full max-w-md gap-3.5 rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/20">
        <h2 className="m-0 text-2xl font-bold">Create Group</h2>
        <input className="w-full rounded-full border border-[#d1d7db] bg-[#f7f8fa] px-4 py-3 outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20" value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
        <input className="w-full rounded-2xl border border-[#d1d7db] bg-[#f7f8fa] px-4 py-3" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
        <div className="flex justify-end gap-2.5">
          <button type="button" className="cursor-pointer rounded-full bg-[#111b21] px-4 py-3 font-bold text-white" onClick={closeModal}>
            Cancel
          </button>
          <button type="button" onClick={handleCreate} className="cursor-pointer rounded-full bg-[#00a884] px-4 py-3 font-bold text-white">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

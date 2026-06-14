import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, Phone, Search, Settings, User } from "lucide-react";

import { fetchChatsThunk, startChatByPhoneThunk } from "../../redux/chat/chatThunk";
import { setActiveChat } from "../../redux/chat/chatSlice";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { chats, loading, error } = useSelector((state) => state.chat);
  const [search, setSearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChatsThunk());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const intervalId = window.setInterval(() => {
      dispatch(fetchChatsThunk());
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [dispatch, isAuthenticated]);

  const getRoomTitle = (room) => {
    if (room.name) return room.name;
    const other = room.participants?.find((member) => member.user_id !== user?.id);
    return other?.name || other?.phone_number || other?.username || `Room ${room.id}`;
  };

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;
    return chats.filter((room) => getRoomTitle(room).toLowerCase().includes(query));
  }, [chats, search]);

  const openRoom = (room) => {
    dispatch(setActiveChat(room));
    navigate("/chat");
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, "");
    if (!cleanPhone) return;

    const result = await dispatch(startChatByPhoneThunk(cleanPhone));
    if (startChatByPhoneThunk.fulfilled.match(result)) {
      setShowStartChat(false);
      setPhoneNumber("");
      navigate("/chat");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-black/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <MessageCircle />
          </div>
          <h1 className="mt-5 text-3xl font-bold">ChatApp</h1>
          <p className="mt-2 text-slate-400">Login with your name and phone number to start chatting.</p>
          <Link to="/login" className="mt-6 inline-flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white no-underline hover:bg-blue-500">
            Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              {(user?.name || user?.username || "U")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="m-0 truncate text-lg font-semibold">{user?.name || user?.username || "User"}</h1>
            <p className="m-0 truncate text-sm text-slate-400">{user?.phone_number || "Online"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <Search className="h-5 w-5" />
          <Link to="/profile" className="rounded-full p-2 text-slate-300 no-underline hover:bg-slate-800 hover:text-white" aria-label="Edit profile">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-900 px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 pl-11 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent Chats</h2>
          </div>

          {filteredChats.length ? (
            filteredChats.map((room) => (
              <button
                type="button"
                key={room.id}
                onClick={() => openRoom(room)}
                className="grid w-full cursor-pointer grid-cols-[52px_1fr_auto] items-center gap-3 border-0 border-b border-slate-900 bg-transparent px-4 py-3 text-left hover:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
                  {getRoomTitle(room)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-base font-medium text-white">{getRoomTitle(room)}</h3>
                  <p className="m-0 truncate text-sm text-slate-400">{room.last_message?.content || "No messages yet"}</p>
                </div>
                <span className="text-xs text-slate-500">Now</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-16 text-center text-slate-400">
              <MessageCircle className="mx-auto mb-3 h-10 w-10" />
              <p className="m-0">No chats yet. Start a chat with a phone number.</p>
            </div>
          )}
        </section>
      </main>

      <button
        type="button"
        onClick={() => setShowStartChat(true)}
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light text-white shadow-xl shadow-blue-950/30 hover:bg-blue-500"
        aria-label="Start new chat"
      >
        +
      </button>

      <nav className="grid grid-cols-3 border-t border-slate-800 bg-slate-900 px-2 py-2 text-xs text-slate-400">
        <button type="button" className="grid justify-items-center gap-1 border-0 bg-transparent py-1 text-blue-400">
          <MessageCircle className="h-5 w-5" />
          Chats
        </button>
        <button type="button" className="grid justify-items-center gap-1 border-0 bg-transparent py-1 text-slate-400">
          <Phone className="h-5 w-5" />
          Calls
        </button>
        <Link to="/profile" className="grid justify-items-center gap-1 py-1 text-slate-400 no-underline">
          <User className="h-5 w-5" />
          Profile
        </Link>
      </nav>

      {showStartChat && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/60 p-4 sm:items-center sm:justify-center">
          <form onSubmit={handleStartChat} className="grid w-full gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:max-w-md">
            <div>
              <h2 className="m-0 text-xl font-semibold">Start new chat</h2>
              <p className="mt-1 text-sm text-slate-400">Enter a registered phone number.</p>
            </div>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
              autoFocus
            />
            {error && <p className="m-0 text-sm font-semibold text-red-400">{error.detail || "Could not start chat"}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowStartChat(false)} className="rounded-xl border border-slate-700 bg-transparent px-4 py-3 font-semibold text-slate-300">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-70">
                {loading ? "Opening..." : "Start Chat"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

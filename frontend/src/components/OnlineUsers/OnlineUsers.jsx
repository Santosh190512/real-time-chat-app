export default function OnlineUsers({ online = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-slate-400"}`} />
      <span>{online ? "Online" : "Offline"}</span>
    </div>
  );
}

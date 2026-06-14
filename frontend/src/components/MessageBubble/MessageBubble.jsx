import FilePreview from "../FilePreview/FilePreview";

export default function MessageBubble({ message, own }) {
  const status = message.status === "seen" || message.status === "delivered" ? "✓✓" : "✓";

  return (
    <div className={`flex ${own ? "justify-end" : ""}`}>
      <div
        className={`max-w-[min(560px,78%)] rounded-2xl px-4 py-2 text-[14.5px] leading-6 text-white ${
          own ? "bg-blue-600" : "bg-slate-800"
        }`}
      >
        {!own && (
          <span className="mb-1 block text-xs font-semibold text-slate-400">
            {message.sender_display_name || message.sender_phone_number || message.sender_name}
          </span>
        )}
        <FilePreview message={message} />
        {own && (
          <span
            className={`mt-1 block text-right text-[11px] ${
              message.status === "seen" ? "text-cyan-300 font-black" : "text-slate-300/80"
            }`}
            style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)" }}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

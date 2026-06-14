export default function TypingIndicator({ users = [] }) {
  if (!users.length) return null;

  return <div className="px-1 text-sm text-slate-500">{users.join(", ")} typing...</div>;
}

import { useSelector } from "react-redux";

export default function useChat() {
  return useSelector((state) => state.chat);
}

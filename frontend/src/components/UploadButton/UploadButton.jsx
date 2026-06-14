import { useDispatch } from "react-redux";

import { uploadChatFile } from "../../api/uploadApi";
import { addRealtimeMessage } from "../../redux/message/messageSlice";

const getMessageType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
};

export default function UploadButton({ roomId }) {
  const dispatch = useDispatch();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !roomId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message_type", getMessageType(file));
    formData.append("content", file.name);

    const message = await uploadChatFile(roomId, formData);
    dispatch(addRealtimeMessage(message));
    e.target.value = "";
  };

  return (
    <label className="cursor-pointer rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700">
      Attach
      <input type="file" onChange={handleUpload} className="hidden" />
    </label>
  );
}

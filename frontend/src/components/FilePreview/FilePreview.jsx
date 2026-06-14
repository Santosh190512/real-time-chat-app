export default function FilePreview({ message }) {
  if (message.message_type === "image") {
    return <img src={message.file_url} alt="" className="block max-h-80 max-w-[min(360px,100%)] rounded-lg object-contain" />;
  }

  if (message.message_type === "video") {
    return (
      <video controls className="block max-h-80 max-w-[min(360px,100%)] rounded-lg object-contain">
        <source src={message.file_url} />
      </video>
    );
  }

  if (message.message_type === "document") {
    return (
      <a href={message.file_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 no-underline">
        Open Document
      </a>
    );
  }

  return <p className="m-0">{message.content}</p>;
}

export const getRoomTitle = (room, currentUserId) => {
  if (!room) return "";
  if (room.name) return room.name;
  const other = room.participants?.find((member) => member.user_id !== currentUserId);
  return other?.name || other?.phone_number || other?.username || `Room ${room.id}`;
};

export const getRoomInitial = (room, currentUserId) =>
  getRoomTitle(room, currentUserId)?.[0]?.toUpperCase() || "C";

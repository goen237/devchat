export function validatePrivateChatInput(data: { userId?: string }): string | null {
  if (!data.userId) {
    return "userId fehlt";
  }
  if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    return "Gültige userId erforderlich";
  }
  return null;
}

export function validateGroupChatInput(data: { name?: string; participantIds?: string[] }): string | null {
  if (!data.name?.trim()) {
    return "Name des Gruppenchats erforderlich";
  }
  if (!data.participantIds || !Array.isArray(data.participantIds)) {
    return "participantIds muss ein Array sein";
  }
  if (data.participantIds.length < 1) {
    return "Mindestens 1 Teilnehmer erforderlich";
  }
  return null;
}
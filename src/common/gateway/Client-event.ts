// THESE ARE EVENTS THAT THE FRONT END LISTENS FOR
export const CLIENT_EVENT = {
  NOTIFICATION: (userId: string) => `notification:${userId}`,
  CHAT: (chatId: string) => `chat:${chatId}`, // USE THIS TO LISTEN FOR INCOMING CHAT MESSAGES TO A CHAT
  DELETE_MESSAGE: (chatId: string) => `delete-message:${chatId}`, // USE THIS TO DELETE A MESSAGE FROM A CHAT
};

export const SERVER_EVENT = {
  CHAT: `chat`, // USE THIS TO SEND CHAT MESSAGES TO A CHAT
  DELETE_MESSAGE: `delete-message`, // USE THIS TO DELETE A MESSAGE FROM A CHAT
};

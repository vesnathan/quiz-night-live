// GraphQL subscriptions - these are parsed by codegen to generate operation types

export const ON_NEW_CHAT_MESSAGE = /* GraphQL */ `
  subscription OnNewChatMessage($channelId: ID!) {
    onNewChatMessage(channelId: $channelId) {
      id
      channelId
      senderId
      senderUsername
      senderDisplayName
      content
      createdAt
    }
  }
`;

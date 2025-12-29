// GraphQL mutations - these are parsed by codegen to generate operation types

export const UPDATE_DISPLAY_NAME = /* GraphQL */ `
  mutation UpdateDisplayName($displayName: String!) {
    updateDisplayName(displayName: $displayName) {
      id
      displayName
    }
  }
`;

export const ENSURE_PROFILE = /* GraphQL */ `
  mutation EnsureProfile($displayName: String!) {
    ensureProfile(displayName: $displayName) {
      id
      email
      displayName
      createdAt
      stats {
        totalCorrect
        totalWrong
        totalPoints
        setsPlayed
        setsWon
        currentStreak
        longestStreak
      }
    }
  }
`;

export const SEND_CHAT_MESSAGE = /* GraphQL */ `
  mutation SendChatMessage($channelId: ID!, $content: String!) {
    sendChatMessage(channelId: $channelId, content: $content) {
      id
      channelId
      senderId
      senderDisplayName
      content
      createdAt
    }
  }
`;

export const START_CONVERSATION = /* GraphQL */ `
  mutation StartConversation($targetUserId: ID!) {
    startConversation(targetUserId: $targetUserId) {
      id
      participantIds
      participants {
        id
        displayName
      }
      updatedAt
    }
  }
`;

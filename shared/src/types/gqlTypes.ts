export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AblyTokenResponse = {
  expires: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type ChatMessage = {
  channelId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  senderDisplayName: Scalars['String']['output'];
  senderId: Scalars['ID']['output'];
  senderUsername: Scalars['String']['output'];
};

export type ChatMessageConnection = {
  items: Array<ChatMessage>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type Conversation = {
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<ChatMessage>;
  participantIds: Array<Scalars['ID']['output']>;
  participants: Array<UserPublic>;
  updatedAt: Scalars['String']['output'];
};

export type CreateQuestionInput = {
  category: Scalars['String']['input'];
  correctIndex: Scalars['Int']['input'];
  difficulty: Scalars['String']['input'];
  explanation?: InputMaybe<Scalars['String']['input']>;
  options: Array<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};

export type GameState = {
  currentSetId?: Maybe<Scalars['String']['output']>;
  isSetActive: Scalars['Boolean']['output'];
  nextSetTime: Scalars['String']['output'];
  playerCount: Scalars['Int']['output'];
};

export type Leaderboard = {
  entries: Array<LeaderboardEntry>;
  type: LeaderboardType;
  updatedAt: Scalars['String']['output'];
};

export type LeaderboardEntry = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  memberSince?: Maybe<Scalars['String']['output']>;
  rank: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export enum LeaderboardType {
  ALL_TIME = 'ALL_TIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export type Mutation = {
  createQuestion?: Maybe<Question>;
  seedQuestions?: Maybe<Scalars['Int']['output']>;
  sendChatMessage?: Maybe<ChatMessage>;
  startConversation?: Maybe<Conversation>;
  updateDisplayName?: Maybe<User>;
};


export type MutationCreateQuestionArgs = {
  input: CreateQuestionInput;
};


export type MutationSeedQuestionsArgs = {
  questions: Array<CreateQuestionInput>;
};


export type MutationSendChatMessageArgs = {
  channelId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
};


export type MutationStartConversationArgs = {
  targetUserId: Scalars['ID']['input'];
};


export type MutationUpdateDisplayNameArgs = {
  displayName: Scalars['String']['input'];
};

export type Query = {
  checkScreenNameAvailable: Scalars['Boolean']['output'];
  getAblyToken?: Maybe<AblyTokenResponse>;
  getChatMessages?: Maybe<ChatMessageConnection>;
  getGameState?: Maybe<GameState>;
  getLeaderboard?: Maybe<Leaderboard>;
  getMyConversations: Array<Conversation>;
  getMyProfile?: Maybe<User>;
  getMyRank?: Maybe<Scalars['Int']['output']>;
  getUserProfile?: Maybe<UserPublic>;
  listQuestions?: Maybe<QuestionConnection>;
};


export type QueryCheckScreenNameAvailableArgs = {
  screenName: Scalars['String']['input'];
};


export type QueryGetChatMessagesArgs = {
  channelId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetLeaderboardArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  type: LeaderboardType;
};


export type QueryGetMyConversationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetMyRankArgs = {
  type: LeaderboardType;
};


export type QueryGetUserProfileArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryListQuestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};

export type Question = {
  category: Scalars['String']['output'];
  correctIndex: Scalars['Int']['output'];
  difficulty: Scalars['String']['output'];
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  options: Array<Scalars['String']['output']>;
  text: Scalars['String']['output'];
};

export type QuestionConnection = {
  items: Array<Question>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type Subscription = {
  onNewChatMessage?: Maybe<ChatMessage>;
};


export type SubscriptionOnNewChatMessageArgs = {
  channelId: Scalars['ID']['input'];
};

export type User = {
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  stats: UserStats;
  username: Scalars['String']['output'];
};

export type UserPublic = {
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  stats: UserStats;
  username: Scalars['String']['output'];
};

export type UserStats = {
  currentStreak: Scalars['Int']['output'];
  longestStreak: Scalars['Int']['output'];
  setsPlayed: Scalars['Int']['output'];
  setsWon: Scalars['Int']['output'];
  totalCorrect: Scalars['Int']['output'];
  totalPoints: Scalars['Int']['output'];
  totalWrong: Scalars['Int']['output'];
};

export type UpdateDisplayNameMutationVariables = Exact<{
  displayName: Scalars['String']['input'];
}>;


export type UpdateDisplayNameMutation = { updateDisplayName?: { id: string, displayName: string } | null };

export type SendChatMessageMutationVariables = Exact<{
  channelId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type SendChatMessageMutation = { sendChatMessage?: { id: string, channelId: string, senderId: string, senderUsername: string, senderDisplayName: string, content: string, createdAt: string } | null };

export type StartConversationMutationVariables = Exact<{
  targetUserId: Scalars['ID']['input'];
}>;


export type StartConversationMutation = { startConversation?: { id: string, participantIds: Array<string>, updatedAt: string, participants: Array<{ id: string, username: string, displayName: string }> } | null };

export type GetMyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyProfileQuery = { getMyProfile?: { id: string, email: string, username: string, displayName: string, createdAt: string, stats: { totalCorrect: number, totalWrong: number, totalPoints: number, setsPlayed: number, setsWon: number, currentStreak: number, longestStreak: number } } | null };

export type GetUserProfileQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserProfileQuery = { getUserProfile?: { id: string, username: string, displayName: string, stats: { totalCorrect: number, totalWrong: number, totalPoints: number, setsPlayed: number, setsWon: number, currentStreak: number, longestStreak: number } } | null };

export type GetLeaderboardQueryVariables = Exact<{
  type: LeaderboardType;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLeaderboardQuery = { getLeaderboard?: { type: LeaderboardType, updatedAt: string, entries: Array<{ rank: number, userId: string, username: string, displayName: string, score: number }> } | null };

export type GetGameStateQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGameStateQuery = { getGameState?: { isSetActive: boolean, currentSetId?: string | null, nextSetTime: string, playerCount: number } | null };

export type GetAblyTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAblyTokenQuery = { getAblyToken?: { token: string, expires: string } | null };

export type GetChatMessagesQueryVariables = Exact<{
  channelId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetChatMessagesQuery = { getChatMessages?: { nextToken?: string | null, items: Array<{ id: string, channelId: string, senderId: string, senderUsername: string, senderDisplayName: string, content: string, createdAt: string }> } | null };

export type GetMyConversationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMyConversationsQuery = { getMyConversations: Array<{ id: string, participantIds: Array<string>, updatedAt: string, participants: Array<{ id: string, username: string, displayName: string }>, lastMessage?: { id: string, content: string, createdAt: string, senderDisplayName: string } | null }> };

export type OnNewChatMessageSubscriptionVariables = Exact<{
  channelId: Scalars['ID']['input'];
}>;


export type OnNewChatMessageSubscription = { onNewChatMessage?: { id: string, channelId: string, senderId: string, senderUsername: string, senderDisplayName: string, content: string, createdAt: string } | null };

# Live Pub Quiz - Technical Documentation

## Overview

Live Pub Quiz is a real-time multiplayer trivia game with buzzer mechanics. Players compete to answer questions fastest, with latency compensation ensuring fair play across different network conditions.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │◄───►│   Ably          │◄───►│  Orchestrator   │
│   (Next.js)     │     │   (Pub/Sub)     │     │  (Node.js)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   Browser       │                           │   DynamoDB      │
│   SessionStorage│                           │   (Questions,   │
│   (Player State)│                           │    Users, etc)  │
└─────────────────┘                           └─────────────────┘
```

### Components

1. **Frontend (Next.js)** - React-based SPA with real-time updates
2. **Ably** - Real-time pub/sub messaging service
3. **Orchestrator** - Node.js service managing game state and timing
4. **DynamoDB** - Persistent storage for questions, users, leaderboards

## Real-Time Communication

### Ably Channels

| Channel | Purpose |
|---------|---------|
| `quiz:game` | Main game events (questions, buzzes, answers, scores) |
| `quiz:presence` | Player presence tracking (who's online) |
| `quiz:buzzer` | Reserved for future buzzer-specific events |

### Event Flow

```
Orchestrator                    Ably                      Players
     │                           │                           │
     │──── question_start ──────►│──────────────────────────►│
     │                           │                           │
     │                           │◄─────── buzz ─────────────│
     │◄── buzz (from player) ────│                           │
     │                           │                           │
     │──── buzz_winner ─────────►│──────────────────────────►│
     │                           │                           │
     │                           │◄─────── answer ───────────│
     │◄── answer (from player) ──│                           │
     │                           │                           │
     │──── answer (result) ─────►│──────────────────────────►│
     │                           │                           │
     │──── question_end ────────►│──────────────────────────►│
     │                           │                           │
     │──── set_end ─────────────►│──────────────────────────►│
```

### Message Payloads

#### `question_start`
```typescript
{
  question: {
    id: string;
    text: string;
    options: string[];      // 4 options
    category: string;
    difficulty: string;
    // Note: correctIndex is NOT included
  };
  questionIndex: number;    // 0-19
  totalQuestions: number;   // 20
}
```

#### `buzz`
```typescript
{
  playerId: string;
  username: string;
  timestamp: number;        // Client timestamp
  latency: number;          // Player's measured latency
  adjustedTimestamp: number; // Latency-compensated timestamp
}
```

#### `buzz_winner`
```typescript
{
  playerId: string;
  username: string;
  adjustedTimestamp: number;
}
```

#### `answer`
```typescript
{
  playerId: string;
  answerIndex: number;      // 0-3, or -1 for timeout
  isCorrect: boolean;
  correctIndex: number;
  pointsAwarded: number;    // +50 or -200
}
```

#### `question_end`
```typescript
{
  correctIndex: number;
  scores: Record<string, number>;  // playerId -> score
  winnerId: string | null;
}
```

#### `set_end`
```typescript
{
  finalScores: Record<string, number>;
  leaderboard: LeaderboardEntry[];
}
```

## Game Timing

### Set Schedule

```
Hour    :00 ─────────── :30 ─────────── :00
         │    LIVE SET   │    BREAK     │
         │   (30 mins)   │   (30 mins)  │
         └───────────────┴──────────────┘
```

- **Sets run**: Minutes 0-29 of each hour
- **Breaks**: Minutes 30-59 of each hour
- **Questions per set**: 20

### Question Timing

```
Question Start
     │
     ├──── BUZZER WINDOW (5-7 seconds) ────┤
     │                                      │
     │  [Player buzzes]                     │
     │       │                              │
     │       ├── ANSWER WINDOW (2 sec) ──┤  │
     │       │                            │  │
     │       │  [Answer or Timeout]       │  │
     │       │                            │  │
     │       └────────────────────────────┘  │
     │                                      │
     ├──── Results Display (2 sec) ─────────┤
     │                                      │
     └──── Next Question ───────────────────┘
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SET_DURATION_MINUTES` | 30 | Active game duration |
| `SET_BREAK_MINUTES` | 30 | Break between sets |
| `QUESTIONS_PER_SET` | 20 | Questions in each set |
| `ANSWER_TIMEOUT_MS` | 2000 | Time to answer after buzzing |
| `QUESTION_DISPLAY_MS` | 5000 | Time before auto-advancing |
| `BETWEEN_QUESTIONS_MS` | 3000 | Delay between questions |

## Scoring System

### Points

| Action | Points |
|--------|--------|
| Correct answer | +50 |
| Wrong answer | -200 |
| Timeout (no answer) | -200 |

### Latency Compensation

To ensure fairness, buzz timestamps are adjusted for network latency:

```typescript
adjustedTimestamp = clientTimestamp - (latency / 2);
```

- Latency is measured via ping/pong every 5 seconds
- Maximum compensation: 300ms
- The player with the earliest **adjusted** timestamp wins the buzz

## Frontend State Management

### Zustand Store (`gameStore.ts`)

```typescript
interface GameStore {
  // Player
  player: Player | null;

  // Game state
  currentQuestion: Question | null;
  questionIndex: number;

  // Buzzer
  buzzerEnabled: boolean;
  buzzerWinner: string | null;
  answerDeadline: number | null;

  // Answer
  selectedAnswer: number | null;
  revealedAnswer: number | null;
  isCorrect: boolean | null;

  // Scores
  scores: Record<string, number>;

  // Timing
  isSetActive: boolean;
  nextSetTime: number;

  // Players
  players: Player[];
}
```

### Persistence

Player state is persisted to `sessionStorage`:
- Survives page refreshes
- Cleared when browser tab is closed
- Only `player` object is persisted (not game state)

## Presence System

### How It Works

1. **Lobby Observer**: Creates anonymous Ably connection to watch presence
2. **Game Player**: Enters presence with username when joining game
3. **Tracking**: Both lobby and game pages can see online player count

### Presence Data

```typescript
{
  username: string;
  displayName: string;
  isLobbyVisitor?: boolean;  // True for lobby-only observers
}
```

## Notifications

### Browser Notifications

Players can enable desktop notifications for:
- 1 minute before set starts
- 30 seconds before
- 10 seconds before
- When set starts

### Implementation

```typescript
// Request permission
await Notification.requestPermission();

// Send notification
new Notification('Quiz Starting Soon!', {
  body: 'The next quiz set starts in 30 seconds!',
  icon: '/favicon.ico',
  tag: 'quiz-notification',
});
```

## Orchestrator

### Starting the Orchestrator

```bash
cd backend
ABLY_API_KEY="your-key" yarn orchestrator
```

### Game Loop

```typescript
while (true) {
  const minutes = new Date().getMinutes();

  if (minutes < 30) {
    // Active set period
    if (!currentSession) {
      await startNewSet();
    }
    // Manage questions...
  } else {
    // Break period
    if (currentSession) {
      await endSet();
    }
  }

  await sleep(1000);
}
```

### Singleton Pattern (React Strict Mode)

Both `useAbly` and `useLobbyPresence` hooks use a singleton pattern to handle React 18 Strict Mode:

```typescript
// Module-level state (outside React)
let ably: Ably.Realtime | null = null;
let refCount = 0;

export function useAbly() {
  useEffect(() => {
    refCount++;
    if (refCount === 1) {
      initAbly();  // Only init once
    }

    return () => {
      refCount--;
      if (refCount === 0) {
        setTimeout(() => {
          if (refCount === 0) {
            cleanupAbly();  // Delayed cleanup
          }
        }, 100);
      }
    };
  }, []);
}
```

This prevents connection churn from Strict Mode's double-mount behavior.

## Database Schema

### Tables

| Table | Key | Description |
|-------|-----|-------------|
| `quiz-users-{stage}` | `id` | User profiles and stats |
| `quiz-questions-{stage}` | `id` | Question bank |
| `quiz-sets-{stage}` | `id` | Set history |
| `quiz-scores-{stage}` | `pk`, `sk` | Per-set scores |
| `quiz-leaderboards-{stage}` | `type`, `period` | Leaderboards |

### Question Schema

```typescript
{
  id: string;           // UUID
  text: string;         // Question text
  options: string[];    // 4 answer options
  correctIndex: number; // 0-3
  category: string;     // e.g., "science", "history"
  difficulty: string;   // "easy", "medium", "hard"
  status: string;       // "unused" or "used"
}
```

## Development

### Running Locally

1. **Start Frontend**:
```bash
cd frontend
yarn dev
```

2. **Start Orchestrator**:
```bash
cd backend
ABLY_API_KEY="your-key" yarn orchestrator
```

3. **Open Browser**: http://localhost:3000

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ABLY_KEY` | frontend/.env.local | Ably key for frontend |
| `ABLY_API_KEY` | backend (runtime) | Ably key for orchestrator |
| `AWS_REGION` | .env | AWS region for DynamoDB |
| `STAGE` | .env | Deployment stage (dev/prod) |

## Deployment

### Infrastructure (AWS)

- **Lambda**: API handlers (game, user, leaderboard, ably-auth)
- **DynamoDB**: All persistent data
- **S3 + CloudFront**: Frontend static hosting
- **Route53**: DNS (quiznight.live)

### Deploy Commands

```bash
cd deploy
npx tsx deploy.ts --stage dev    # Development
npx tsx deploy.ts --stage prod   # Production
```

## Security Considerations

1. **Ably Keys**: Use token auth in production (not API keys in frontend)
2. **Answer Validation**: Correct answer index never sent to client
3. **Latency Cap**: 300ms max compensation prevents exploitation
4. **Session Isolation**: Players can only answer when they've won the buzz

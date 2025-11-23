# CallOut MVP Walkthrough

## Overview
The CallOut MVP has been successfully implemented with the following core features:
- **Authentication**: User sign-up and login using NextAuth.js (Credentials provider with mock verification for MVP).
- **League Management**: Create and join private leagues via invite codes.
- **Prop Betting**: Create props (Yes/No, Over/Under), place bets with virtual credits, and track pools.
- **Admin Controls**: League owners can resolve or cancel props.
- **Leaderboards**: Track user rankings within leagues based on net winnings.
- **UI/UX**: Modern, responsive design integrated from the provided landing page mockup, using Tailwind CSS and Radix UI components.

## Setup Instructions
1.  **Database Setup**: Ensure PostgreSQL is running and `DATABASE_URL` is set in `.env`.
    ```bash
    npx prisma migrate dev
    ```
2.  **Dependencies**: All dependencies are installed.
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Verification Steps

### 1. Authentication
- Go to `/login`.
- Sign in with any email (mock auth creates a user if not exists).
- Verify redirection to `/dashboard`.

### 2. League Management
- **Create League**: On Dashboard, click "Create League". Fill in name/description. Verify redirection to league page.
- **Join League**: On Dashboard, click "Join League". Enter an invite code (get one from a created league). Verify membership.

### 3. Prop Management
- **Create Prop**: Inside a league, click "Create Prop". Enter details (Question, Type, Deadline). Verify it appears on the board.
- **Place Bet**: Click on a prop. Enter wager amount on a side. Verify credits are deducted and potential payout is calculated.
- **Resolve Prop**: (As creator) Go to prop details. Click "Resolve" (Yes/No/Over/Under). Verify winnings are distributed.
- **Cancel Prop**: (As creator) Click "Cancel". Verify bets are refunded.

### 4. Leaderboard
- Go to "Leaderboard" tab in a league.
- Verify rankings update after prop resolution.

## Known Issues / Notes
- **Authentication**: Uses a mock credential provider. For production, integrate `bcrypt` and a real email provider or OAuth.
- **Date Picker**: Uses `react-day-picker` v8 due to dependency constraints.
- **Charts**: `recharts` is installed but basic chart components are ready for future analytics features.

## Next Steps
- Implement real email verification.
- Add more robust error handling and loading states.
- Enhance the betting logic (e.g., odds calculation if needed, though currently pool-based).

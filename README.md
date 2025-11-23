# CallOut MVP

A private leagues, prop betting, and leaderboard application built with Next.js, Prisma, and NextAuth.

## Features

- **Authentication**: Secure user registration and login
- **League Management**: Create, join, leave, and delete private leagues
- **Props**: Create custom propositions with fixed wager amounts
- **Betting**: Place bets on props with automatic credit management
- **Leaderboards**: Track performance across league members
- **User Navigation**: Seamless navigation between dashboard and leagues

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library, Playwright

## Getting Started

### Prerequisites
- Node.js 18+ (currently using v23.4.0)
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and NextAuth secret

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Project Structure

```
callout_mvp/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utilities (db, auth)
├── prisma/
│   └── schema.prisma     # Database schema
├── __tests__/            # Unit & integration tests
├── e2e/                  # End-to-end tests
└── public/               # Static assets
```

## License

MIT

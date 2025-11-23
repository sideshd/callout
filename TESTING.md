# Testing Guide

This project includes a comprehensive testing suite covering unit, integration, and end-to-end (E2E) tests.

## Test Structure

```
callout_mvp/
├── __tests__/
│   ├── components/        # Unit tests for React components
│   │   └── create-prop-form.test.tsx
│   └── actions/           # Integration tests for server actions
│       └── prop-actions.test.ts
├── e2e/                   # End-to-end tests
│   ├── auth.spec.ts
│   ├── league.spec.ts
│   └── prop.spec.ts
├── jest.config.ts         # Jest configuration
├── jest.setup.ts          # Jest setup (polyfills, matchers)
└── playwright.config.ts   # Playwright configuration
```

## Running Tests

### Unit & Integration Tests (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Run E2E tests
npm run e2e

# Run E2E tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

## Test Coverage

### Unit Tests
- **CreatePropForm**: Validates form rendering and default values

### Integration Tests
- **createProp**: Tests prop creation with mocked Prisma and NextAuth
- **Membership validation**: Ensures non-members cannot create props

### E2E Tests
- **Authentication**: Full registration and login flow
- **League Management**: Create and delete leagues
- **Props & Betting**: Create props and place bets

## Writing New Tests

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Integration Test Example
```typescript
import { myAction } from '@/app/actions'
import { prisma } from '@/lib/db'

jest.mock('@/lib/db')
jest.mock('next-auth')

describe('myAction', () => {
  it('performs action', async () => {
    ;(prisma.model.create as jest.Mock).mockResolvedValue({ id: '1' })
    await myAction(formData)
    expect(prisma.model.create).toHaveBeenCalled()
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Notes

- E2E tests require the dev server to be running (Playwright starts it automatically)
- Integration tests mock Next.js functions (`redirect`, `revalidatePath`)
- All tests use `--legacy-peer-deps` due to React 19 compatibility

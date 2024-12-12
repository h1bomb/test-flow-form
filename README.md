# Test Flow Form

A monorepo project using pnpm workspace containing server, client, and test packages.

## Project Structure

- `packages/server`: Koa backend with MySQL and Drizzle ORM
- `packages/client`: React frontend with Vite and Ant Design
- `packages/test`: Playwright e2e tests

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
# Start the backend server
pnpm --filter @test-flow-form/server dev

# Start the frontend development server
pnpm --filter @test-flow-form/client dev

# Run tests
pnpm --filter @test-flow-form/test test
```

## Database Setup

Before running the server, make sure to:
1. Install MySQL
2. Create a database named 'test_flow_form'
3. Update the database connection configuration in `packages/server/src/index.ts`

## Available Scripts

Each package has its own scripts that can be run using pnpm:

### Server
- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server

### Client
- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build

### Test
- `test`: Run Playwright tests
- `test:ui`: Run tests with UI

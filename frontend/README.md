# Frontend - Bancolombia Leasing Demo

React client application for leasing request filing, tracking, and operational management.

## Tech Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS

## Frontend Architecture

Source root:

- `src`

Organization approach:

- feature-based modules for request workflows
- reusable UI components
- hooks for async data fetching and state handling (React Query style)

Typical folders:

- `src/features/requests`
- `src/components`
- `src/pages`
- `src/hooks`
- `src/lib`
- `src/models`
- `src/test`

## Run Locally

### 1. Prerequisites

- Node.js 18+ and npm
- Backend API running (default: `http://localhost:8080`)

### 2. Install Dependencies

From `frontend`:

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Default local URL:

- `http://localhost:5173`

### 4. Production Build

```bash
npm run build
```

## Notes

- API base URL can be configured through Vite environment variables.
- Keep feature boundaries clear and avoid coupling page components with transport logic.

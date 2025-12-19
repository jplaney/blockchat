# Setup Guide

This guide covers setting up BlockChat for local development.

## Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **npm**: Included with Node.js
- **Git**: For cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/jplaney/blockchat.git
cd blockchat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root (optional for development):

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-development-secret-key
```

### 4. Start the Development Server

```bash
npm run dev
```

This starts both the Express backend and Vite frontend on port 5000.

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

### Project Structure

```
nelles-chat-o-matic/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts            # Entry point
│   ├── routes.ts           # WebSocket signaling
│   ├── vite.ts             # Vite integration
│   └── static.ts           # Static file serving
├── shared/                 # Shared code
│   └── schema.ts           # Type definitions
├── attached_assets/        # Avatar images
└── package.json
```

### Making Changes

#### Frontend Changes
- Edit files in `client/src/`
- Changes hot-reload automatically
- React components use TypeScript
- Styling uses Tailwind CSS

#### Backend Changes
- Edit files in `server/`
- Server restarts automatically with `tsx`
- WebSocket logic is in `routes.ts`

#### Shared Types
- Edit `shared/schema.ts` for types used by both frontend and backend
- Zod schemas provide runtime validation

## Testing Voice Chat Locally

### Single Browser Testing
1. Open `http://localhost:5000` in one tab
2. Open `http://localhost:5000` in another tab (or incognito)
3. Use the same PIN in both tabs
4. You should hear yourself (with echo)

### Multi-Device Testing
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Open `http://YOUR_LOCAL_IP:5000` on another device
3. Both devices must be on the same network

**Note**: Microphone access requires HTTPS in production. Localhost is exempt for development.

## Troubleshooting

### "Microphone access denied"
- Check browser permissions (click lock icon in address bar)
- Ensure your mic is connected and working
- Try a different browser

### WebSocket connection fails
- Check that port 5000 is not blocked
- Ensure no firewall is blocking connections
- Verify the server is running

### Audio not working between peers
- Both users need to allow microphone access
- Check browser console for WebRTC errors
- Ensure ICE candidates are being exchanged (check network tab)

## IDE Setup

### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### TypeScript Configuration

The project uses TypeScript with strict mode. Type checking runs automatically.

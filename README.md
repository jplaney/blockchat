# BlockChat

A Minecraft-themed voice chat application for family gaming sessions. Connect instantly using a 6-digit PIN code to join voice chat rooms with your family.

![Voice Chat Interface](https://img.shields.io/badge/WebRTC-Peer--to--Peer-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue)

## Features

- **Instant Connection**: Join voice rooms using simple 6-digit PIN codes
- **Push-to-Talk or Toggle**: Choose your preferred voice mode
- **Minecraft Avatars**: Select from 6 themed character avatars
- **Connection Quality**: Real-time signal strength indicators
- **Speaking Indicators**: See who's talking with visual feedback
- **QR Code Sharing**: Easily invite family members
- **Sound Check**: Test your mic and speakers before joining
- **Dark/Light Mode**: Automatic theme support

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, WebSocket
- **Voice**: WebRTC peer-to-peer mesh network
- **Build**: Vite, esbuild

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jplaney/blockchat.git
cd blockchat

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Using the App

1. Enter your nickname and select an avatar
2. Enter a 6-digit PIN (or make one up to create a room)
3. Click "Join Chat" and allow microphone access
4. Complete the sound check
5. Start chatting! Share the PIN with family members

## Documentation

- [Setup Guide](./SETUP.md) - Detailed local development setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `SESSION_SECRET` | Session encryption key | (required) |

## Architecture

```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui)
    pages/        # Route components
    hooks/        # Custom React hooks
server/           # Express backend
  routes.ts       # WebSocket signaling server
  index.ts        # Server entry point
shared/           # Shared types and schemas
```

### How Voice Chat Works

1. **Signaling**: WebSocket server coordinates peer connections
2. **WebRTC**: Direct peer-to-peer audio streams (no server relay)
3. **Mesh Network**: All participants connect directly to each other
4. **Room Capacity**: Maximum 4 participants per room

## Security Features

- 6-digit PIN codes (1 million combinations)
- IP-based rate limiting (5 failed attempts = 5-minute lockout)
- Room locking after 2 users connect
- 4-hour automatic session expiration
- No audio data passes through the server

## Docker

```bash
# Build the image
docker build -t blockchat .

# Run the container
docker run -p 5000:5000 -e SESSION_SECRET=your-secret blockchat
```

See [docker-compose.yml](./docker-compose.yml) for orchestration.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Minecraft-style pixel art avatars
- WebRTC for real-time communication

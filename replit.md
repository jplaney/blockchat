# Family Voice Chat

## Overview

A parent-child voice chat application that enables simple, secure voice communication for family gaming sessions. Users connect instantly using a 4-digit PIN code to join voice chat rooms. The application prioritizes child-friendly interactions with clear status indicators, large touch targets, and zero learning curve design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Design System**: Material Design 3 inspired, focusing on simplicity and child-friendly interactions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript using tsx for development
- **Real-time Communication**: WebSocket server (ws library) for signaling
- **Build Process**: esbuild for server bundling, Vite for client bundling

### Voice Chat Implementation
- **Signaling**: WebSocket-based signaling server for WebRTC peer connection establishment
- **Room Management**: In-memory room storage using PIN codes as identifiers
- **Single Room Lock**: Once 2 users connect, that room is locked as the only active room - preventing others from creating new rooms with different PINs. The system resets when all users leave.
- **Room Capacity**: Maximum 4 players per room
- **Peer Connection**: WebRTC for direct peer-to-peer voice communication (mesh network)
- **Message Types**: Join, offer, answer, ICE candidate exchange

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` for shared types between client and server
- **Validation**: Zod schemas for runtime validation (PIN codes, WebSocket messages)
- **Storage Abstraction**: Interface-based storage pattern with in-memory implementation

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components (shadcn/ui)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
    pages/        # Route components
server/           # Express backend
  routes.ts       # WebSocket signaling server
  storage.ts      # Data storage abstraction
  static.ts       # Static file serving
shared/           # Shared types and schemas
```

## External Dependencies

### Real-time Communication
- **WebSocket (ws)**: Signaling server for WebRTC connection establishment
- **WebRTC**: Browser API for peer-to-peer voice communication (no external dependency)

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Database toolkit and query builder
- **connect-pg-simple**: PostgreSQL session store for Express

### UI Framework
- **Radix UI**: Accessible component primitives (dialogs, menus, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server bundling
- **TypeScript**: Type checking across the stack
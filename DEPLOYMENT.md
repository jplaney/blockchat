# Deployment Guide

This guide covers deploying BlockChat to production environments.

## Requirements

- **HTTPS**: Required for microphone access and WebRTC
- **WebSocket Support**: Server must support WebSocket upgrades
- **Node.js 18+**: Runtime requirement

## Deployment Options

### Option 1: Replit (Easiest)

The project is pre-configured for Replit deployment:

1. Import the repository to Replit
2. Click "Run" to start
3. Use the Replit deploy feature for production

### Option 2: Docker

```bash
# Build the image
docker build -t nelles-chat-o-matic .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e SESSION_SECRET=your-secure-secret \
  --name chat-app \
  nelles-chat-o-matic
```

### Option 3: Traditional Server

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=5000
export SESSION_SECRET=your-secure-secret

# Start the server
npm run start
```

## Reverse Proxy Configuration

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket specific
    location /ws {
        proxy_pass http://localhost:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

### Caddy (Simpler)

```caddyfile
yourdomain.com {
    reverse_proxy localhost:5000
}
```

Caddy automatically handles HTTPS and WebSocket upgrades.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | Yes | Set to `production` |
| `SESSION_SECRET` | Yes | Secure random string for sessions |

Generate a secure session secret:
```bash
openssl rand -base64 32
```

## WebRTC Considerations

### STUN Servers

The app uses Google's public STUN servers by default. For production, consider:

1. **Self-hosted STUN**: Run your own coturn server
2. **Commercial STUN**: Use Twilio, Xirsys, or similar

### TURN Servers (Recommended for Production)

TURN servers relay traffic when direct peer connections fail (strict NAT/firewalls).

To add TURN support, modify the ICE configuration in `voice-chat.tsx`:

```typescript
const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

### Recommended TURN Providers
- [Twilio Network Traversal](https://www.twilio.com/docs/stun-turn)
- [Xirsys](https://xirsys.com/)
- [coturn](https://github.com/coturn/coturn) (self-hosted)

## Scaling Considerations

### Current Limitations

- **4 users per room**: Mesh topology limits participant count
- **In-memory storage**: Rooms are lost on server restart
- **Single server**: No horizontal scaling support

### Future Improvements

For larger deployments, consider:

1. **SFU Architecture**: Use mediasoup or Janus for 10+ participants
2. **Redis for Rooms**: Persist room state across restarts
3. **Load Balancing**: Sticky sessions for WebSocket connections

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] SESSION_SECRET is a secure random string
- [ ] Firewall allows only ports 443 (HTTPS) and WebSocket
- [ ] Rate limiting configured at reverse proxy level
- [ ] Regular security updates applied

## Monitoring

### Health Check

The server responds to HTTP requests on the root path. Use this for health checks:

```bash
curl https://yourdomain.com/
```

### Logs

In Docker:
```bash
docker logs chat-app -f
```

On server:
```bash
npm run start 2>&1 | tee app.log
```

## Troubleshooting

### WebSocket 502 errors
- Ensure reverse proxy forwards WebSocket upgrades
- Check `proxy_read_timeout` is high enough

### Audio not connecting
- Verify STUN servers are accessible
- Consider adding TURN servers for NAT traversal
- Check browser console for ICE connection failures

### Microphone permission denied
- HTTPS is required (except localhost)
- Check Content Security Policy headers

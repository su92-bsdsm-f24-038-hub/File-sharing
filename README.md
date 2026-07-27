

# Sync

A high-performance local file transfer utility. Sync allows you to quickly pair your phone with your laptop via QR code and send files, links, and text back and forth seamlessly over your local network.

## Features

- **Instant Pairing:** Scan a QR code to join a transfer room securely.
- **Fast Local Transfers:** Files are transferred chunk-by-chunk using Socket.IO, optimizing for local network speeds.
- **Cross-Platform:** Works in any modern web browser on any device.
- **Real-Time Progress:** View granular progress bars for incoming and outgoing files.
- **Voice Notes:** Record and send audio messages directly within the chat.

## Recent Updates

- **Legal Pages Added:** Dedicated pages for Privacy Policy, Terms of Service, and Contact Us.
- **UI Enhancements:** Added an "Enter Code" quick link to the main navigation header for easier access.
- **Bug Fixes:** Resolved runtime errors with Framer Motion `useMotionValue` in Client Components (`GlassCard`).
## Getting Started

### 1. Prerequisites

- Node.js **18+** (tested on v18.20.4)
- npm 10+
- A Firebase project (free Spark plan is enough)

### 2. Clone / Navigate

```bash
cd "file sharing"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Go to **Authentication → Sign-in method** and enable:
   - **Email/Password**
   - **Google**
4. Go to **Project Settings → General → Your apps** → click Web app `</>` icon
5. Register the app and copy the config values
6. In **Authentication → Settings → Authorized domains**, add `localhost`

### 5. Environment Variables

Copy the example file and fill in your Firebase config:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
SOCKET_PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 6. Run

```bash
npm run dev
```

This starts **both** servers concurrently:

| Process | URL |
|---------|-----|
| Next.js frontend | http://localhost:3000 |
| Socket.IO server | http://localhost:4000 |

---

## Usage Flow

1. Open **http://localhost:3000** on your laptop
2. Sign in with email/password or Google
3. Click **"Generate Session"** on the dashboard
4. A QR code + 4-digit PIN appear
5. Scan the QR code with your phone camera
6. Your phone opens `/join/[roomId]?pin=XXXX` automatically
7. Both devices show **"Connected ✓"**
8. Drag-and-drop files, type messages — transfer happens via binary WebSocket chunks
9. Session auto-expires after 5 minutes of inactivity

---

## Project Structure

```
file sharing/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (AuthProvider, fonts)
│   ├── globals.css               # Global styles (Tailwind v4)
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Email/password + Google login
│   ├── signup/page.tsx           # Registration
│   ├── forgot-password/page.tsx  # Firebase password reset
│   ├── dashboard/page.tsx        # Authenticated hub (QR + transfer)
│   └── join/[roomId]/page.tsx    # Mobile pairing + transfer UI
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── ProgressBar.tsx
│   ├── ConnectionStatus.tsx      # Animated status dot + expiry timer
│   ├── FileMessage.tsx           # File transfer card with progress
│   ├── QRCodeDisplay.tsx         # Canvas-based QR renderer
│   ├── TextMessage.tsx           # Chat bubble with copy button
│   └── TransferPanel.tsx         # Full send/receive panel
│
├── context/
│   └── AuthContext.tsx           # Firebase auth context
│
├── lib/
│   ├── firebase.ts               # Firebase app singleton
│   ├── socket.ts                 # Socket.IO client singleton
│   └── utils.ts                  # cn(), formatBytes(), etc.
│
├── server/
│   └── index.ts                  # Standalone Express + Socket.IO server
│
├── types/
│   └── index.ts                  # Shared TS types + socket event types
│
├── tsconfig.json                 # Next.js TypeScript config
├── tsconfig.server.json          # Server-side TypeScript config
├── next.config.ts
├── postcss.config.mjs
├── package.json                  # Scripts: dev (concurrently), build, etc.
└── .env.local.example
```

---

## Security Notes

- **Room IDs** use `crypto.randomUUID()` — cryptographically random
- **PIN** is an additional human-friendly verification layer
- **Max 2 devices** per room — third join attempt is rejected
- **Rate limit**: max 5 new rooms per minute per user
- **File type whitelist** validated server-side before accepting chunks
- **Max file size**: 50 MB — enforced both client and server side
- **Text sanitization**: HTML entities escaped before broadcast
- **Session expiry**: 5-minute inactivity timer, reset on each event

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Next.js + Socket server |
| `npm run dev:next` | Next.js only (port 3000) |
| `npm run dev:socket` | Socket server only (port 4000) |
| `npm run build` | Production build of Next.js |

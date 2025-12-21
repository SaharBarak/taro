# Sync (סינק)

> Civic consensus platform for Israeli municipalities

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000.svg)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-17-black.svg)](https://nextjs.org/)

## Overview

Sync empowers Israeli citizens to participate in local democracy through transparent, blockchain-verified consensus voting. Citizens can vote on municipal affairs with multi-layer verification including GPS pinning, financial authentication, and social signatures.

### Key Features

- 🗳️ **Transparent Voting** - All votes recorded on Qubik blockchain
- 📍 **GPS Verification** - Confirm voters are within municipality boundaries
- 💳 **Financial Authentication** - ₪1 vote / ₪50 to create vote
- 🪙 **Token Rewards** - Earn Sync tokens for civic participation
- 🔐 **Multi-layer Auth** - Clerk + Social Signature + GPS + Payment

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- iOS/Android device with Expo Go (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/SaharBarak/Taro.git
cd Taro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
# Run all apps
pnpm dev

# Run web only
pnpm dev --filter @sync/web

# Run mobile only
pnpm dev --filter @sync/mobile
```

### Testing on iPhone

**Website:**
```bash
# Start web server
pnpm dev --filter @sync/web

# In another terminal, expose via ngrok
ngrok http 3000
```
Open the ngrok URL on your iPhone.

**Mobile App:**
```bash
cd apps/mobile
npx expo start --tunnel
```
Scan the QR code with your iPhone camera (Expo Go required).

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js 17 website
│   └── mobile/              # Expo React Native app
├── packages/
│   ├── shared/              # Types, constants, utilities
│   ├── api-client/          # API client library
│   └── design-tokens/       # Design system tokens
└── docs/
    └── PRD.md               # Product Requirements
```

## Tech Stack

### Web
- **Framework:** Next.js 17
- **Animations:** Framer Motion + Lenis
- **Styling:** CSS Modules + Design Tokens

### Mobile
- **Framework:** Expo SDK 52
- **Navigation:** Expo Router v4
- **Styling:** NativeWind (Tailwind)
- **Animations:** React Native Reanimated

### Backend Services
- **Auth:** Clerk
- **Blockchain:** Qubik
- **Database:** Converge
- **Payments:** Green Invoice + Grow
- **Email:** Resend

## Design System

Hebrew RTL-first design with strict token usage:

```tsx
// ✅ Correct
<View className="bg-primary-600 p-4">

// ❌ Wrong - no hardcoded values
<View style={{ backgroundColor: '#2563EB' }}>
```

### Typography Scale (1.2 Minor Third)
- Fonts: Heebo (headings), Assistant (body)
- Scale: xs → 7xl (0.694rem → 4.3rem)

### Colors
- Primary: Trust Blue (#2563EB)
- Secondary: Growth Green (#10B981)
- Accent: Innovation Purple (#8B5CF6)

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Qubik Blockchain
QUBIK_API_KEY=
QUBIK_NETWORK=mainnet

# Converge Database
CONVERGE_API_KEY=
CONVERGE_PROJECT_ID=

# Payments
GREEN_INVOICE_API_KEY=
GREEN_INVOICE_SECRET=
GROW_API_KEY=

# Email
RESEND_API_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=https://sync.co.il
EXPO_PUBLIC_API_URL=https://api.sync.co.il
```

## Mobile App Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Welcome | `/(auth)` | App introduction |
| Sign In | `/(auth)/sign-in` | Clerk authentication |
| Sign Up | `/(auth)/sign-up` | Registration + verification |
| Onboarding | `/(auth)/onboarding` | Municipality selection |
| Home | `/(tabs)` | Active votes feed |
| All Votes | `/(tabs)/votes` | Searchable vote list |
| Create | `/(tabs)/create` | 3-step vote wizard |
| Profile | `/(tabs)/profile` | Stats & settings |
| Vote Detail | `/vote/[id]` | GPS verify + vote |

## API Endpoints

### Votes
- `GET /api/votes` - List votes
- `GET /api/votes/[id]` - Vote details
- `POST /api/votes` - Create vote (₪50)
- `POST /api/votes/[id]/participate` - Cast vote (₪1)
- `POST /api/votes/[id]/verify-location` - GPS check

### User
- `GET /api/user/profile` - Get profile
- `POST /api/user/profile` - Create profile
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/tokens` - Token balance

### Payments
- `POST /api/payments/create` - Payment intent
- `POST /api/payments/webhook` - Green Invoice webhook

## Scripts

```bash
pnpm dev          # Start development servers
pnpm build        # Build all packages
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript validation
pnpm test         # Run tests
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## Roadmap

- [x] Core website with landing pages
- [x] Mobile app with auth flow
- [x] Vote creation and participation UI
- [ ] Clerk authentication integration
- [ ] Qubik blockchain integration
- [ ] Green Invoice payment processing
- [ ] Social Signature algorithm
- [ ] Municipality GPS boundaries
- [ ] Token economy activation

## License

MIT © 2024 Sync

---

**Built with ❤️ for Israeli civic engagement**

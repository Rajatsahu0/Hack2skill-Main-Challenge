# RoamAI - AI-Powered Travel Planning & Experience Engine

[![Live Demo](https://img.shields.io/badge/Live-Demo-violet)](https://roamai-hack2skill.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)

RoamAI is a production-quality full-stack travel planning application featuring AI-driven itinerary generation, real-time weather disruption replanning, interactive map visualization, Socket.IO notifications, and an AI chat travel assistant.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React 19      │────▶│  Express.js API  │────▶│  MongoDB Atlas  │
│   (Vercel)      │◀────│  (Render)        │◀────│                 │
│                 │     │                  │     └─────────────────┘
│  Tailwind CSS   │     │  Socket.IO       │     ┌─────────────────┐
│  React Router   │◀───▶│  JWT Auth        │────▶│  Groq/Gemini AI │
│  Axios          │     │  Rate Limiting   │     └─────────────────┘
│  Socket.IO      │     │                  │     ┌─────────────────┐
│  Leaflet Maps   │     │                  │────▶│  OpenWeather API│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Features

- **AI Itinerary Generation** — Day-wise plans with attractions, food, transport, costs
- **Dynamic Weather Replanning** — Auto-swaps outdoor activities when rain detected
- **Real-Time Notifications** — Socket.IO push alerts for weather & itinerary changes
- **AI Travel Assistant** — Chat interface to modify plans (budget, food, activities)
- **Trending Destinations** — Season-based travel recommendations
- **How to Reach** — Travel options (train/bus/flight) with budget impact analysis
- **Interactive Maps** — Leaflet.js with color-coded markers and route visualization
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **JWT Authentication** — Secure register/login with auto-refresh

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client, Leaflet.js |
| Backend | Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Socket.IO |
| AI | Groq (free) / Google Gemini / OpenAI — configurable |
| Weather | OpenWeather API (with mock fallback) |
| Deployment | Vercel (frontend) + Render (backend) |

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)

### Backend Setup
```bash
cd WarmUp/backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

### Frontend Setup
```bash
cd WarmUp/frontend
npm install
npm run dev
```

### Run Tests
```bash
cd WarmUp/backend
npm test
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_...        # Free AI (recommended)
GEMINI_API_KEY=              # Alternative free AI
AI_MODEL=llama-3.3-70b-versatile
OPENWEATHER_API_KEY=         # Optional (has mock fallback)
FRONTEND_URL=https://your-app.vercel.app
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login & get JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/trips | Yes | List user trips |
| POST | /api/trips | Yes | Create trip + generate itinerary |
| GET | /api/trips/:id | Yes | Get trip details |
| GET | /api/trips/trending | Yes | Seasonal destinations |
| POST | /api/trips/travel-options | Yes | Train/bus/flight options |
| GET | /api/trips/weather/check | Yes | Check weather for city |
| GET | /api/itineraries/:tripId | Yes | Get itinerary |
| POST | /api/itineraries/:tripId/chat | Yes | AI modify itinerary |
| POST | /api/itineraries/:tripId/replan | Yes | Weather replan |
| GET | /api/notifications | Yes | Get notifications |
| PUT | /api/notifications/:id | Yes | Mark as read |

## Security

- JWT token authentication with 7-day expiry
- Password hashing with bcryptjs (10 salt rounds)
- Rate limiting (100 req/min per IP)
- Input validation on all endpoints
- CORS configured for production domains
- Environment variables for all secrets

## Testing

```bash
npm test          # Run all tests
npm test -- --coverage  # With coverage report
```

## Deployment

- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Render (auto-deploy from GitHub)
- **Database**: MongoDB Atlas (free M0 cluster)

## License

MIT

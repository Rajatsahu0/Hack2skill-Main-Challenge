# RoamAI - Full-Stack Travel Planning & Experience Engine

RoamAI is a production-quality travel planning web application featuring an AI-driven itinerary generator, real-time weather disruption replanning, interactive map visualization, real-time Socket.IO notification feeds, and an AI chat travel assistant.

---

## Technical Stack

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-time Client**: Socket.IO Client
- **Interactive Maps**: Leaflet.js (dark-mode compatible open-source maps fallback)

### Backend
- **Framework**: Node.js, Express
- **Database**: MongoDB (via Mongoose ODM)
- **Security**: JWT Authentication, bcryptjs
- **Real-time Engine**: Socket.IO
- **AI Engine**: OpenAI API (`gpt-4o-mini`)
- **Weather API**: OpenWeather API

---

## Directory Structure

```text
WarmUp_Challenge/
│
├── backend/
│   ├── config/             # Database configuration
│   ├── controllers/        # Express handlers (MVC)
│   ├── middleware/         # JWT Authentication validators
│   ├── models/             # Mongoose schemas (User, Trip, Itinerary, Notification)
│   ├── routes/             # Express routing files
│   ├── services/           # External API wrappers (OpenAI, OpenWeather)
│   ├── sockets/            # Socket.IO event handler
│   ├── .env.example        # Environment variables template
│   ├── app.js              # Express app configs
│   └── server.js           # Server listen & Socket setup
│
└── frontend/
    ├── src/
    │   ├── components/     # Visual components (Navbar, TravelMap)
    │   ├── context/        # Session Auth & Socket states
    │   ├── pages/          # Pages (Landing, Dashboard, Form, Details)
    │   ├── App.jsx         # App router
    │   ├── index.css       # Tailwind entry styles
    │   └── main.jsx        # App mounting script
    ├── tailwind.config.js  # Color schemes & animations config
    ├── vite.config.js      # Proxy settings
    └── index.html          # HTML entry & CDNs
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or Atlas connection string)

### 1. Setup Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd WarmUp_Challenge/backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Define your keys in `.env` (the application runs a mock generator if `OPENAI_API_KEY` is omitted, and uses OpenStreetMap/Leaflet fallback if no Google Maps key is defined):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/travel_engine
   JWT_SECRET=travel_engine_super_secret_session_token_123456
   JWT_EXPIRES_IN=7d
   OPENAI_API_KEY=your_openai_key
   GOOGLE_MAPS_API_KEY=
   OPENWEATHER_API_KEY=
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd WarmUp_Challenge/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server (runs on `http://localhost:3000` and proxies `/api` and `/socket.io` to `http://localhost:5000`):
   ```bash
   npm run dev
   ```

---

## Features & Verification Steps

### 1. Register & Login
- Open `http://localhost:3000`. You will be welcomed by a responsive landing page.
- Select "Get Started" to sign up. After filling out `name`, `email`, and `password`, you will be logged in and redirected to the dashboard.
- The authentication token is persistent. Refreshing the browser will automatically trigger the `/api/auth/me` check.

### 2. Trip Creation Questionnaire
- From the Dashboard, click "Plan a New Trip".
- Fill out destination city, dates, budget, travelers count, travel style, interests, and dietary/mobility constraints.
- Click "Consult RoamAI Assistant". You will see a loading indicator while the AI builds your itinerary.

### 3. Timeline & Leaflet Mapping
- Once generated, you will enter the workspace.
- Toggle through the days at the top to see the morning (M), afternoon (A), and evening (E) activities.
- The map plots the coordinates for each activity. Panning and zooming are fully interactive, and dashed route paths are drawn between markers.

### 4. Weather Simulation & Replanning (Socket.IO Showcase)
- Click "Simulate Rain" in the weather widget.
- This issues a POST request to trigger severe weather.
- The backend identifies outdoor events (e.g. Beaches, walks) and triggers OpenAI/local rule matching to swap them for indoor alternatives (museums, indoor food tours).
- A Socket.IO event `notification` is emitted instantly. You'll see a real-time sync pop-up alert, and the itinerary in your schedule updates automatically.
- Check the "Re-route Change Audit Logs" below the schedule to view the reason.

### 5. AI Chat Assistant Tweak
- Locate the "AI Travel Assistant" chat window.
- Select a quick prompt pill (like "Reduce budget" or "Suggest local food") or type a customized instructions (e.g., "Add adventure activities").
- The assistant process the command, responds in the chat, and immediately modifies the schedule (which live-refreshes the map route and costs).

---

## API Documentation

All routes except authentication require a `Bearer <JWT_TOKEN>` header.

### Authentication Router (`/api/auth`)
- `POST /register`: Register a new user profile.
- `POST /login`: Validate credentials and sign JWT.
- `GET /me`: Fetch authenticated user profile.

### Trips Router (`/api/trips`)
- `POST /`: Initialize a trip and generate itinerary.
- `GET /`: List all saved trips for the user.
- `GET /:id`: Fetch detailed trip and itinerary info.
- `GET /weather/check?city=CityName`: Fetch live weather metrics for a destination.

### Itineraries Router (`/api/itineraries`)
- `GET /:tripId`: Get itinerary detail mapping.
- `POST /:tripId/chat`: Send prompt messages to modify schedules.
- `POST /:tripId/replan`: Trigger weather checks or mock simulation events to replan itineraries.

### Notifications Router (`/api/notifications`)
- `GET /`: Fetch list of alerts.
- `PUT /:id`: Toggle read status to true.

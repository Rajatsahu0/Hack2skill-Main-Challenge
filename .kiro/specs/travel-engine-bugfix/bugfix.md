# Bugfix Requirements Document

## Introduction

The Travel Planning & Experience Engine (RoamAI) deviates from its required specification in several areas: it uses Leaflet/OpenStreetMap instead of the required Google Maps API integration, the frontend is missing required folder structure directories (`layouts/`, `routes/`, `services/`, `hooks/`, `utils/`), the backend is missing a required `utils/` folder, and the landing page lacks a dedicated Call-to-Action (CTA) section before the footer. These deviations represent implementation gaps that need to be corrected to match the project specification.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the map component renders THEN the system uses Leaflet.js with OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org`) instead of Google Maps API for map visualization

1.2 WHEN the map component displays activity locations THEN the system uses Leaflet `L.marker()` and `L.divIcon()` instead of Google Maps markers

1.3 WHEN the map component draws routes between activities THEN the system uses Leaflet `L.polyline()` instead of Google Maps route/directions visualization

1.4 WHEN the map component loads THEN the system loads Leaflet CSS from unpkg CDN instead of loading the Google Maps JavaScript SDK

1.5 WHEN a developer looks for frontend service abstractions THEN the system has no `services/` folder for API service modules

1.6 WHEN a developer looks for reusable custom hooks THEN the system has no `hooks/` folder for shared React hooks

1.7 WHEN a developer looks for utility functions in the frontend THEN the system has no `utils/` folder for helper/utility modules

1.8 WHEN a developer looks for layout wrapper components THEN the system has no `layouts/` folder for page layout components

1.9 WHEN a developer looks for centralized route definitions THEN the system has no `routes/` folder for route configuration modules

1.10 WHEN a developer looks for backend utility functions THEN the system has no `utils/` folder in the backend directory

1.11 WHEN a user views the landing page THEN the system does not display a dedicated Call-to-Action (CTA) section before the footer to drive user sign-up conversion

### Expected Behavior (Correct)

2.1 WHEN the map component renders THEN the system SHALL use the Google Maps JavaScript API to display an interactive map with proper API key authentication

2.2 WHEN the map component displays activity locations THEN the system SHALL use Google Maps Markers (or AdvancedMarkerElement) to plot activity locations with custom styling

2.3 WHEN the map component draws routes between activities THEN the system SHALL use Google Maps route visualization (Polyline or Directions API) to show paths between activity markers

2.4 WHEN the map component loads THEN the system SHALL load the Google Maps JavaScript SDK (via script tag or `@googlemaps/js-api-loader`) with the configured API key

2.5 WHEN a developer looks for frontend service abstractions THEN the system SHALL have a `frontend/src/services/` folder containing API service modules (e.g., axios instance configuration, API call wrappers)

2.6 WHEN a developer looks for reusable custom hooks THEN the system SHALL have a `frontend/src/hooks/` folder containing shared React hooks

2.7 WHEN a developer looks for utility functions in the frontend THEN the system SHALL have a `frontend/src/utils/` folder containing helper/utility modules

2.8 WHEN a developer looks for layout wrapper components THEN the system SHALL have a `frontend/src/layouts/` folder containing page layout components (e.g., MainLayout with Navbar)

2.9 WHEN a developer looks for centralized route definitions THEN the system SHALL have a `frontend/src/routes/` folder containing route configuration and protected route logic

2.10 WHEN a developer looks for backend utility functions THEN the system SHALL have a `backend/utils/` folder containing shared utility modules (e.g., response helpers, validation utilities)

2.11 WHEN a user views the landing page THEN the system SHALL display a dedicated CTA section before the footer with a compelling headline and sign-up/action button to drive conversion

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the map displays activity markers THEN the system SHALL CONTINUE TO show morning (M), afternoon (A), and evening (E) markers with distinct color coding (violet, teal, amber)

3.2 WHEN the map displays routes THEN the system SHALL CONTINUE TO draw dashed path lines connecting activity locations in sequence

3.3 WHEN the map renders THEN the system SHALL CONTINUE TO be responsive and display correctly on both mobile and desktop viewports

3.4 WHEN markers are clicked THEN the system SHALL CONTINUE TO show popup information with activity name and description

3.5 WHEN the dark/light mode toggle is clicked THEN the system SHALL CONTINUE TO switch themes using the class-based dark mode strategy with localStorage persistence

3.6 WHEN the landing page loads THEN the system SHALL CONTINUE TO display the Hero section with headline, description, and navigation buttons

3.7 WHEN the landing page loads THEN the system SHALL CONTINUE TO display the Features section with AI-Powered Generation, Weather-Responsive Replanning, and Interactive Navigation cards

3.8 WHEN the landing page loads THEN the system SHALL CONTINUE TO display the How It Works section with the 4-step process flow

3.9 WHEN the backend receives API requests THEN the system SHALL CONTINUE TO use the existing controller/route/service/middleware architecture without breaking existing endpoints

3.10 WHEN users authenticate THEN the system SHALL CONTINUE TO use JWT-based authentication with the existing auth middleware

3.11 WHEN weather events trigger replanning THEN the system SHALL CONTINUE TO emit Socket.IO notifications in real-time

3.12 WHEN the AI chat assistant receives prompts THEN the system SHALL CONTINUE TO modify itineraries and refresh the map visualization accordingly

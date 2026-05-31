# Requirements Document

## Introduction

This document specifies requirements for four new features to enhance the RoamAI Travel Planning & Experience Engine: Nearby Recommendations, Budget Tracker, Packing List Generator, and Trip Export/Share. These features extend the existing trip details page to provide richer planning tools, financial visibility, smart preparation assistance, and collaboration capabilities.

## Glossary

- **RoamAI_System**: The full-stack travel planning application comprising a React frontend and Node.js/Express backend
- **Recommendations_Service**: The backend service responsible for fetching nearby points of interest based on geographic coordinates
- **Budget_Tracker**: The frontend dashboard component that aggregates and visualizes trip spending data from itinerary activities
- **Packing_List_Generator**: The AI-powered service that produces a context-aware packing list based on trip parameters
- **Export_Service**: The backend service responsible for generating shareable trip formats (PDF or shareable link)
- **Trip_Details_Page**: The existing frontend page displaying itinerary timeline, map, and AI chat assistant for a specific trip
- **Activity_Card**: The existing UI component displaying a single time-slot activity (morning, afternoon, or evening) with attraction, cost, food, and transport details
- **Itinerary**: The stored day-by-day schedule containing morning, afternoon, and evening activity slots with cost, attraction, food, and transport fields
- **Places_API**: An external geocoding and points-of-interest API (Google Places or free alternative such as Overpass/OpenTripMap)
- **User**: An authenticated person who owns trips and interacts with the system

## Requirements

### Requirement 1: Fetch Nearby Recommendations

**User Story:** As a traveler, I want to see nearby cafés, restaurants, ATMs, pharmacies, and photo spots for a selected activity, so that I can discover useful places close to my planned attractions.

#### Acceptance Criteria

1. WHEN a User selects an Activity_Card on the Trip_Details_Page, THE Recommendations_Service SHALL query the Places_API for points of interest within a 1 km radius of the activity attraction coordinates
2. WHEN the Places_API returns results, THE Recommendations_Service SHALL return up to 10 recommendations grouped by category (café, restaurant, ATM, pharmacy, photo spot)
3. IF the Places_API is unavailable or returns an error, THEN THE Recommendations_Service SHALL return a descriptive error message and the Trip_Details_Page SHALL display a user-friendly fallback notice
4. WHEN recommendations are fetched, THE Trip_Details_Page SHALL display each recommendation with its name, category, distance from the activity, and rating (if available)

### Requirement 2: Display Recommendations on Map

**User Story:** As a traveler, I want to see nearby recommendations overlaid on the existing trip map, so that I can visually understand their proximity to my planned activities.

#### Acceptance Criteria

1. WHEN nearby recommendations are loaded for a selected activity, THE Trip_Details_Page SHALL overlay recommendation markers on the existing Leaflet map
2. THE Trip_Details_Page SHALL use distinct marker icons or colors for each recommendation category (café, restaurant, ATM, pharmacy, photo spot)
3. WHEN a User clicks a recommendation marker on the map, THE Trip_Details_Page SHALL display a popup with the place name, category, and distance
4. WHEN the User selects a different Activity_Card or day, THE Trip_Details_Page SHALL clear previous recommendation markers and load new ones for the newly selected activity

### Requirement 3: Budget Tracker Aggregation

**User Story:** As a traveler, I want to see a breakdown of my trip spending versus my total budget, so that I can track whether I am within my planned budget.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL compute total estimated cost by summing the cost field from all activity slots across all days in the Itinerary
2. THE Budget_Tracker SHALL compute per-day cost totals by summing morning, afternoon, and evening activity costs for each day
3. THE Budget_Tracker SHALL compute category-level cost breakdowns by aggregating costs into food, transport, and activities categories using the food, transport, and cost fields from each activity slot
4. WHEN the Itinerary is modified (via AI chat or weather replanning), THE Budget_Tracker SHALL recalculate all aggregations to reflect the updated Itinerary

### Requirement 4: Budget Tracker Visualization

**User Story:** As a traveler, I want to see visual progress bars and charts for my budget breakdown, so that I can quickly understand my spending at a glance.

#### Acceptance Criteria

1. THE Trip_Details_Page SHALL display a budget summary panel showing total spent versus total budget with a progress bar
2. THE Trip_Details_Page SHALL display per-day spending as individual progress bars relative to an even daily budget allocation (total budget divided by number of days)
3. THE Trip_Details_Page SHALL display a category breakdown showing food, transport, and activities as labeled segments or bars with percentage and absolute values
4. WHEN total estimated cost exceeds the trip budget, THE Trip_Details_Page SHALL visually indicate the overage with a warning color and a descriptive label

### Requirement 5: AI Packing List Generation

**User Story:** As a traveler, I want an AI-generated packing list tailored to my destination, weather, trip duration, and planned activities, so that I can prepare appropriately for my trip.

#### Acceptance Criteria

1. WHEN a User requests a packing list from the Trip_Details_Page, THE Packing_List_Generator SHALL generate a categorized packing list using the trip destination, start date, end date, current weather forecast, and planned activities as context
2. THE Packing_List_Generator SHALL organize items into categories (clothing, toiletries, electronics, documents, activity-specific gear)
3. IF the AI service is unavailable, THEN THE Packing_List_Generator SHALL return a descriptive error message and the Trip_Details_Page SHALL display a user-friendly fallback notice
4. THE Trip_Details_Page SHALL display the generated packing list in a dedicated section accessible from the trip details view with checkable items

### Requirement 6: Packing List Persistence

**User Story:** As a traveler, I want my packing list to be saved so that I can check off items over time and revisit the list later.

#### Acceptance Criteria

1. WHEN a packing list is generated, THE RoamAI_System SHALL persist the packing list associated with the trip in the database
2. WHEN a User checks or unchecks a packing list item, THE RoamAI_System SHALL update the item checked state in the database
3. WHEN a User revisits the Trip_Details_Page, THE RoamAI_System SHALL load the previously saved packing list with its current checked states
4. WHEN a User requests a new packing list for a trip that already has one, THE Packing_List_Generator SHALL replace the existing list with the newly generated list and reset all checked states

### Requirement 7: Trip Export as PDF

**User Story:** As a traveler, I want to export my full itinerary as a PDF document, so that I can access my trip plan offline or print it.

#### Acceptance Criteria

1. WHEN a User requests a PDF export from the Trip_Details_Page, THE Export_Service SHALL generate a PDF document containing the trip destination, dates, budget, and the complete day-by-day itinerary with activity details
2. THE Export_Service SHALL include for each activity slot: the attraction name, activity description, cost, food recommendation, and transport mode
3. THE Export_Service SHALL return the PDF as a downloadable file to the User's browser
4. IF PDF generation fails, THEN THE Export_Service SHALL return a descriptive error message and the Trip_Details_Page SHALL display a user-friendly error notice

### Requirement 8: Trip Sharing via Link

**User Story:** As a traveler, I want to share my trip plan with friends via a shareable link, so that others can view my itinerary without needing an account.

#### Acceptance Criteria

1. WHEN a User requests to share a trip from the Trip_Details_Page, THE RoamAI_System SHALL generate a unique shareable link for the trip
2. THE RoamAI_System SHALL allow unauthenticated access to the shared trip view using the shareable link
3. THE shared trip view SHALL display the trip destination, dates, and full day-by-day itinerary in a read-only format
4. WHEN a User regenerates a share link for the same trip, THE RoamAI_System SHALL invalidate the previous link and generate a new one
5. THE Trip_Details_Page SHALL provide a copy-to-clipboard button for the generated shareable link

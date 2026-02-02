# Production-Grade Real-Time Public Transport Tracking System Plan

## 1. Executive Summary

This document outlines a comprehensive, end-to-end plan for building a robust, thoroughly scalable real-time public transport tracking system tailored for small cities. The system is designed to be cost-effective yet "production-grade," handling issues like GPS drift, network instability, and high concurrency.

## 2. System Architecture

The architecture follows an **Event-Driven Microservices** pattern to ensure decoupling and scalability.

```mermaid
graph TD
    Bus[Bus GPS Device] -->|MQTT/TCP| Ingest[Ingestion Service]
    Ingest -->|Raw Data| Kafka[Message Queue / PubSub]

    Kafka -->|Consume| Processor[Data Processing Service]
    Kafka -->|Consume| Archiver[Archival Service]

    Processor -->|Update State| "Redis[Redis Cache (Latest Location)"]
    Processor -->|Geospatial Queries| DB[PostgreSQL + PostGIS]
    Processor -->|Events| Realtime[Realtime Gateway Service]

    Realtime -->|WebSocket| App[Mobile/Web App]
    Admin[Admin Dashboard] -->|REST/GraphQL| API[Core API Service]
    API --> DB
```

### Core Components

1.  **Ingestion Service**: Specialized in handling high-frequency, low-latency packets from GPS hardware. agnostic to protocol (MQTT, TCP, UDP).
2.  **Processing Service**: Validates data, performs map-matching (snapping raw GPS to road segments), and calculates ETA.
3.  **Core API**: Manages static entities (Routes, Stops, Schedules, Drivers, Buses).
4.  **Realtime Gateway**: Handles WebSocket connections to thousands of end-users, broadcasting updates efficiently.
5.  **Storage Layer**:
    - **PostgreSQL + PostGIS**: For relational data and geospatial queries (e.g., "Find stops near me").
    - **Redis**: For ephemeral "current state" (Driver X is at Lat/Lon Y, speed Z).
    - **TimescaleDB/InfluxDB** (Optional): For historical playback and analytics.

## 3. Technology Stack

- **Runtime**: Node.js (TypeScript) or Go (for Ingestion if extremely high throughput is needed). _We will stick to Node.js/TypeScript for consistency with the current monorepo._
- **Monorepo Tooling**: TurboRepo
- **Database**: PostgreSQL 16 (w/ PostGIS extension)
- **Caching**: Redis (Cluster mode recommended for prod)
- **Message Broker**: RabbitMQ or Redis Streams (Kafka is overkill for small cities < 500 buses). _Recommendation: Redis Streams_ for simplicity and performance.
- **Protocols**:
  - Device -> Server: MQTT (Lightweight, handles spotty networks well).
  - Server -> Client: Socket.IO (Robustness) or uWebSockets.js (Performance).

## 4. Database Schema Design (Key Entities)

### Relational (PostgreSQL)

- **Routes**: `id, name, color, polyline_points`
- **Stops**: `id, name, lat, lon, geohash`
- **RouteStops**: `route_id, stop_id, sequence_order, time_from_start`
- **Vehicles**: `id, plate_number, capacity, device_id`
- **Trips**: `id, route_id, vehicle_id, driver_id, start_time, status (active/completed)`

### Real-Time State (Redis)

- `bus:locations:{trip_id}` -> Hash `{ lat, lon, speed, bearing, last_updated, next_stop_id, eta_next_stop }`
- `geo:bus_positions` -> GEOADD set for radius queries.

## 5. Implementation Roadmap

### Phase 1: Foundation & Ingestion (The "Backend Plumbing")

**Goal**: Receive data from a simulated device and store it.

1.  **Setup Infrastructure**:
    - Initialize TurboRepo with `apps/api` (NestJS/Express) and `apps/ingestor`.
    - Spin up Docker containers for Postgres (PostGIS), Redis.
2.  **Data Modeling**:
    - Define SQL migrations for Routes, Stops, Vehicles.
    - Seed initial data (mock 1 route, 5 stops).
3.  **Ingestion Service**:
    - Create an MQTT Broker (e.g., Aedes) or generic TCP server inside `apps/ingestor`.
    - Accept payloads: `{ device_id, lat, lon, speed, timestamp }`.
    - Validate and push to Redis Stream `stream:gps-raw`.

### Phase 2: Processing & State Management

**Goal**: Turn raw GPS points into meaningful context ("Bus is 5 mins away").

1.  **Worker Service**:
    - Consume from `stream:gps-raw`.
    - **Sanity Check**: Discard points with impossible speeds or jumps.
    - **Map Matching**: (Crucial for production) Don't just show raw GPS. Snap the point to the predefined route polyline.
    - **ETA Calculation**: Distance to next stop / avg_speed.
    - Update Redis `bus:locations` and `geo:bus_positions`.

### Phase 3: Realtime Distribution

**Goal**: Show moving buses on a map.

1.  **Realtime Gateway (`apps/realtime`)**:
    - Subscribe to Redis updates (Pub/Sub).
    - Implement WebSocket namespace `/tracking`.
    - Room logic: Users subscribe to `route_{id}` to receive updates only for relevant buses.
2.  **Frontend (`apps/web`)**:
    - Mapbox GL JS or Leaflet.
    - Draw Route lines.
    - Render markers.
    - **Interpolation**: Animate marker movement between updates to look "smooth" (Linear Interpolation).

### Phase 4: Production Hardening

**Goal**: Resilience and Security.

1.  **Handling Disconnects**:
    - Devices store data locally when offline and burst-upload when reconnected. Ingestor must handle out-of-order timestamps.
2.  **GPS Drift**:
    - Implement a "Geofence" radius around stops. Only trigger "Arrived" events if inside radius & speed < 5km/h.
3.  **Security**:
    - API Key authentication for devices.
    - JWT for frontend users.

## 6. Detailed Plan for "Small City" Configuration

Since static configuration (GTFS) might be missing/expensive:

1.  **Driver App (The "Tracker")**:
    - Instead of expensive hardware, build a React Native app for drivers.
    - App sends location every 5s.
2.  **Admin Panel Route Builder**:
    - Allow admins to draw routes on a map and click to add stops.
    - This generates the "Path" used for snapping.

## 7. Next Steps for You

1.  **Review this Architecture**: Does it fit your scale?
2.  **Select Tech**: Shall we use Fastify or Express? Socket.IO or raw WS?
3.  **Start Phase 1**: We can scaffold the Ingestor and Database today.

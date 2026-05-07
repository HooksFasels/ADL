# ADL - Automated Data Logging & Transit System

A high-performance, real-time transit management and tracking system built with a microservices-ready monorepo architecture. ADL provides robust tools for fleet management, route planning, and live telemetry tracking with a focus on scalability and reliability.

## Tech Stack

*   **Frontend**: React 19 (Vite), Tailwind CSS, Zustand, Recharts, Leaflet
*   **Backend**: Bun (Runtime), Express.js, KafkaJS
*   **Real-time**: Apache Kafka, Redis, Socket.io
*   **Database**: PostgreSQL, Prisma ORM
*   **Validation**: Zod (Schema-first validation)

## Prerequisites

*   **Bun** (v1.1 or higher recommended)
*   **Node.js** (v18 or higher)
*   **Docker** (Required for infrastructure services like Kafka, Redis, and Postgres)

## Setup Instructions

1.  **Infrastructure** Start the required background services using Docker:
    ```bash
    docker-compose up -d
    ```

2.  **Environment Variables** Create a `.env` file in the root directory and ensure individual apps have their configurations (refer to `.env.example`):
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
    REDIS_URL="redis://localhost:6380"
    JWT_SECRET="your_secret_key"
    ```

3.  **Installation** Install the necessary project dependencies using Bun:
    ```bash
    bun install
    ```

4.  **Database Setup** Push the Prisma schema to your local database:
    ```bash
    bun run db:push
    ```

5.  **Running the Application** Start the development server (which concurrently runs all microservices and the web app):
    ```bash
    bun run dev
    ```

The application will be accessible at:
*   **Frontend**: http://localhost:5173
*   **API Gateway**: http://localhost:8000

---

## Project Structure

```text
/ADL
├── apps/
│   ├── api/         # Core REST API (Express)
│   ├── auth/        # Authentication Service
│   ├── gateway/     # API Gateway
│   ├── realtime/    # Kafka & Socket.io Service
│   └── web/         # Frontend Dashboard (React)
├── packages/
│   ├── db/          # Prisma Schema & Client
│   ├── kafka/       # Shared Kafka Utilities
│   ├── redis/       # Redis Connection Logic
│   └── shared-types/# Shared TypeScript Interfaces
└── docker-compose.yml
```

## API Reference (v1)

| Module | Endpoint | Description |
| :--- | :--- | :--- |
| **User** | `POST /api/v1/users` | Register a new user |
| **Auth** | `POST /api/v1/auth/login` | Authenticate and get JWT |
| **Vehicle**| `GET /api/v1/vehicles` | List all registered vehicles |
| **Trips** | `POST /api/v1/trips/start`| Initialize a live trip |
| **GPS** | `POST /api/v1/location/update` | Post live telemetry data |

---

## License
Internal Project. Restricted Usage.

# Church Planner - Architectural Overview

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                        Church Planner System                           │
├───────────────────┬───────────────────┬──────────────────────────────┤
│   Client Layer    │ Infrastructure    │         Data Layer           │
│                   │     Layer         │                              │
├───────────────────┼───────────────────┼──────────────────────────────┤
│                   │                   │                              │
│  ┌─────────────┐  │  ┌─────────────┐  │  ┌────────────┐ ┌─────────┐ │
│  │             │  │  │             │  │  │            │ │         │ │
│  │  Web UI     │◄─┼──┤ API Gateway │◄─┼──┤ PostgreSQL │ │ Redis   │ │
│  │  (React)    │  │  │ (Traefik)   │  │  │ (Primary   │ │ (Cache) │ │
│  │             │  │  │             │  │  │  Database) │ │         │ │
│  └──────┬──────┘  │  └──────┬──────┘  │  └────────────┘ └─────────┘ │
│         │         │         │         │         ▲                    │
│  ┌──────▼──────┐  │  ┌──────▼──────┐  │         │                    │
│  │             │  │  │             │  │         │                    │
│  │  Mobile UI  │◄─┼──┤ Load Balancer│  │         │                    │
│  │  (React     │  │  │             │  │         │                    │
│  │   Native)   │  │  │             │  │         │                    │
│  └─────────────┘  │  └──────┬──────┘  │         │                    │
│                   │         │         │         │                    │
├───────────────────┤         │         ├─────────┼────────────────────┤
│   Service Layer   │         │         │ Message │Bus                 │
├───────────────────┤         │         ├─────────┼────────────────────┤
│                   │         │         │         │                    │
│  ┌─────────────┐  │         │         │  ┌──────▼─────┐             │
│  │             │◄─┼─────────┘         │  │            │             │
│  │ Auth        │  │                   │  │ NATS       │             │
│  │ Service     │◄─┼───────────────────┼──┤ Streaming  │             │
│  │             │  │                   │  │            │             │
│  └─────────────┘  │                   │  └────────────┘             │
│                   │                   │                              │
│  ┌─────────────┐  │                   │                              │
│  │             │◄─┼───────────────────┼──┐                           │
│  │ Churches    │  │                   │  │                           │
│  │ Service     │  │                   │  │                           │
│  │             │  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │             │◄─┼───────────────────┼──┘                           │
│  │ Members     │  │                   │                              │
│  │ Service     │  │                   │                              │
│  │             │  │                   │                              │
│  └─────────────┘  │                   │                              │
│                   │                   │                              │
│  ┌─────────────┐  │                   │                              │
│  │             │◄─┼───────────────────┼──┐                           │
│  │ Events      │  │                   │  │                           │
│  │ Service     │  │                   │  │                           │
│  │             │  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │             │◄─┼───────────────────┼──┘                           │
│  │ Scheduling  │  │                   │                              │
│  │ Service     │  │                   │                              │
│  │             │  │                   │                              │
│  └─────────────┘  │                   │                              │
│                   │                   │                              │
│  ┌─────────────┐  │                   │                              │
│  │             │◄─┼───────────────────┼──┐                           │
│  │ Messaging   │  │                   │  │                           │
│  │ Service     │  │                   │  │                           │
│  │             │  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │             │◄─┼───────────────────┼──┘                           │
│  │ File        │  │                   │                              │
│  │ Service     │  │                   │                              │
│  │             │  │                   │                              │
│  └─────────────┘  │                   │                              │
│                   │                   │                              │
├───────────────────┼───────────────────┼──────────────────────────────┤
│ Monitoring Layer  │                   │                              │
├───────────────────┤                   │                              │
│                   │                   │                              │
│  ┌─────────────┐  │                   │                              │
│  │ Prometheus  │◄─┼───────────────────┼──┐                           │
│  │ (Metrics)   │  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │ Grafana     │◄─┼───────────────────┼──┤                           │
│  │ (Dashboards)│  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │ Loki        │◄─┼───────────────────┼──┤                           │
│  │ (Logs)      │  │                   │  │                           │
│  └─────────────┘  │                   │  │                           │
│                   │                   │  │                           │
│  ┌─────────────┐  │                   │  │                           │
│  │ Jaeger      │◄─┼───────────────────┼──┘                           │
│  │ (Tracing)   │  │                   │                              │
│  └─────────────┘  │                   │                              │
│                   │                   │                              │
└───────────────────┴───────────────────┴──────────────────────────────┘
```

## Architecture Design Principles

### 1. Microservices Architecture

The Church Planner system follows a microservices architecture pattern, with services organized around business capabilities:

- **API Gateway** - Acts as the single entry point for all client requests
- **Auth Service** - Handles authentication and authorization
- **Churches Service** - Manages church entities and their configurations
- **Members Service** - Manages church members and volunteers
- **Events Service** - Manages events and service planning
- **Scheduling Service** - Manages volunteer scheduling and availability
- **Messaging Service** - Handles notifications and communications
- **File Service** - Manages file uploads and media content

### 2. Event-Driven Communication

- Services communicate through two primary patterns:
  - **Synchronous API calls** - For direct request/response interactions
  - **Asynchronous events** - For decoupled, eventual consistency updates

- NATS serves as the backbone of the event-driven architecture, enabling:
  - Message publishing/subscribing
  - Durable message queues
  - Service discovery
  - Load balancing

### 3. Data Management

- **Database-per-service** - Each service owns its data store
- **PostgreSQL** - Primary relational database for structured data
- **Redis** - Used for caching, session management, and transient data

### 4. Security Architecture

- **API Gateway** (Traefik) handles:
  - TLS termination
  - JWT validation
  - Rate limiting
  - IP filtering

- **Auth Service** provides:
  - OAuth2 implementation
  - JWT token issuance and validation
  - User registration and authentication
  - Role-based access control (RBAC)
  - Password hashing and verification
  - User profile management

### 5. Observability Stack

- **Prometheus** - Collects and stores metrics
- **Grafana** - Visualizes metrics and provides dashboards
- **Loki** - Aggregates and queries logs
- **Jaeger** - Distributed tracing for request flows

### 6. Resilience Patterns

- **Circuit Breakers** - Prevent cascading failures
- **Retries with Backoff** - Handle transient failures
- **Rate Limiting** - Protect services from overload
- **Bulkheads** - Isolate failures to specific components
- **Timeouts** - Fail fast when dependencies are slow

## Data Flow

1. **Client Request Flow**:
   - Client makes a request to the API Gateway
   - Gateway authenticates and authorizes the request
   - Request is routed to the appropriate service
   - Service processes the request, potentially calling other services
   - Response returns to the client

2. **Event Flow**:
   - Service publishes an event to NATS
   - Interested services receive the event
   - Each service updates its own state based on the event
   - Services may publish additional events in response

3. **Data Consistency**:
   - The system uses eventual consistency for cross-service data
   - Each service is the source of truth for its own domain
   - Read models are updated asynchronously via events

## Deployment Architecture

The system is containerized using Docker and orchestrated with Kubernetes:

- **Docker** containers package each service and its dependencies
- **Kubernetes** handles:
  - Container orchestration
  - Service discovery
  - Load balancing
  - Self-healing
  - Horizontal scaling

## Development Environment

The development environment uses Docker Compose to simulate the production environment locally:

- Local databases
- Local message broker
- Development-specific configurations
- Hot-reloading for rapid development 
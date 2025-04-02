# Church Planner - Microservices Application

A containerized, microservices-based web application for church planning and service management. This application helps churches manage their services, volunteers, teams, and events in a scalable, fault-tolerant architecture.

## 🌟 Features

- **Multi-tenant** support for multiple churches
- **Service Planning** for creating and managing church services
- **Team Management** for organizing volunteers into ministry teams
- **Scheduling** for assigning volunteers to services and positions
- **Real-time Updates** using WebSockets
- **Notifications** via email and in-app messaging
- **Responsive UI** that works on desktop and mobile

## 🏗️ Architecture

This application is built using a microservices architecture with the following components:

### Backend Services

- **API Gateway** (Traefik) - Route and authorize all incoming requests
- **Auth Service** - Handle authentication, authorization, and user management
- **Churches Service** - Manage church profiles, settings, and preferences
- **Members Service** - Store and manage member/volunteer information
- **Events Service** - Create and manage events and services
- **Scheduling Service** - Handle volunteer scheduling and availability
- **Messaging Service** - Send notifications and communications
- **File Service** - Handle file uploads and media management

### Infrastructure

- **Docker** - Containerization for all services
- **Kubernetes** - Orchestration for container management
- **PostgreSQL** - Primary data store
- **Redis** - Caching and session management
- **NATS** - Messaging and event bus
- **Prometheus & Grafana** - Monitoring and dashboards
- **Loki** - Log aggregation
- **Jaeger** - Distributed tracing

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- kubectl (for Kubernetes deployment)

### Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/church-planner-v3.git
   cd church-planner-v3
   ```

2. Start the development environment:
   ```
   docker-compose up -d
   ```

3. Access the services:
   - Web UI: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Grafana: http://localhost:3001
   - Jaeger: http://localhost:16686

### Kubernetes Deployment

1. Apply Kubernetes manifests:
   ```
   kubectl apply -f k8s/
   ```

2. Access the services (adjust according to your Kubernetes setup):
   ```
   kubectl port-forward svc/church-planner-gateway 8080:80
   ```

## 📊 Monitoring

The application includes a comprehensive monitoring stack:

- **Prometheus** collects metrics from all services
- **Grafana** displays dashboards and visualizations
- **Loki** aggregates logs from all services
- **Jaeger** provides distributed tracing

Access the monitoring dashboards at http://localhost:3001 when running locally.

## 🧪 Testing

Run the test suite:

```
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📦 Project Structure

```
church-planner-v3/
├── services/                 # Microservices
│   ├── api-gateway/          # Traefik API Gateway
│   ├── auth-service/         # Authentication service
│   ├── churches-service/     # Churches management
│   ├── members-service/      # Members/volunteers management
│   ├── events-service/       # Events and services
│   ├── scheduling-service/   # Volunteer scheduling
│   ├── messaging-service/    # Notifications and messaging
│   └── file-service/         # File and media handling
├── frontend/                 # React frontend application
├── k8s/                      # Kubernetes manifests
├── docker-compose.yml        # Local development setup
├── docker-compose.prod.yml   # Production-ready composition
├── .github/                  # GitHub Actions workflows
└── docs/                     # Documentation
```

## 📝 API Documentation

API documentation is available through Swagger UI when running the services:

- Auth Service: http://localhost:3001/api/auth/docs
- Churches Service: http://localhost:3002/api/churches/docs
- Members Service: http://localhost:3003/api/members/docs
- And so on...

## 📚 Additional Documentation

See the `docs/` directory for additional documentation:

- [Architecture Overview](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Strategy](docs/testing.md)
- [Monitoring Setup](docs/monitoring.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Authentication Service

The Authentication Service is responsible for:

- User registration and authentication
- Token generation and validation
- User profile management
- Authorization and access control
- Event publishing for user-related actions

#### Development Setup

```bash
# Navigate to the auth service directory
cd services/auth-service

# Install dependencies
npm install

# Start the service in development mode
npm run start:dev
```

Alternatively, use Docker Compose:

```bash
# Start the auth service with dependencies
docker-compose up auth-service
```

For development with NATS messaging support:

```bash
# Start the service with NATS using the dev configuration
docker-compose -f docker-compose.dev.yml up
```

The service will be available at:
- API: http://localhost:3001/api
- Swagger Documentation: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/api/health

#### API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/verify/:token` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

#### Users API Endpoints

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin or own profile)
- `PATCH /api/users/:id` - Update user (Admin or own profile)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/users/:id/admin` - Add admin role (Admin only)
- `DELETE /api/users/:id/admin` - Remove admin role (Admin only)

#### Event Communication

The Auth Service publishes events using NATS for asynchronous communication with other microservices:

| Event | Topic | Payload | Description |
|-------|-------|---------|-------------|
| User Created | `auth.user.created` | User object (without sensitive data) | Published when a new user registers |
| User Updated | `auth.user.updated` | User object (without sensitive data) | Published when user data is modified |
| User Deleted | `auth.user.deleted` | `{ userId: string }` | Published when a user is deleted |
| User Verified | `auth.user.verified` | `{ userId: string }` | Published when email is verified |
| Password Reset | `auth.user.password_reset` | `{ userId: string }` | Published when password is reset |

These events enable other services to react to user-related changes without direct coupling to the Auth Service.
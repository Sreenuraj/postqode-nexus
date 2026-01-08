# PostQode Nexus - Backend

Spring Boot REST API for Inventory & Product Management.

---

## Quick Start

```bash
# Start database
docker run -d --name nexus-db -p 5432:5432 \
  -e POSTGRES_DB=nexus -e POSTGRES_USER=nexus -e POSTGRES_PASSWORD=nexus123 \
  postgres:15-alpine

# Run backend
mvn spring-boot:run

# Access
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

---

## Project Structure

```
backend/
├── src/main/java/com/postqode/nexus/
│   ├── NexusApplication.java      # Entry point
│   ├── config/
│   │   ├── SecurityConfig.java    # JWT + CORS security
│   │   └── OpenApiConfig.java     # Swagger configuration
│   ├── controller/
│   │   ├── AuthController.java    # Login, logout, /me
│   │   ├── ProductController.java # Product CRUD
│   │   └── GraphQLController.java # GraphQL resolvers
│   ├── dto/
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── ProductRequest.java
│   │   ├── ProductResponse.java
│   │   ├── UserResponse.java
│   │   └── graphql/               # GraphQL DTOs
│   ├── model/
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── ActivityLog.java
│   │   └── enums (UserRole, ProductStatus, ActionType)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── ProductRepository.java
│   │   └── ActivityLogRepository.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── service/
│       ├── AuthService.java
│       ├── ProductService.java
│       └── DashboardService.java
├── src/main/resources/
│   ├── application.yml            # Configuration
│   ├── db/migration/              # Flyway migrations
│   └── graphql/schema.graphqls    # GraphQL schema
├── src/test/java/                 # Tests
├── pom.xml                        # Dependencies
└── Dockerfile                     # Container build
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login, get JWT | No |
| POST | `/api/v1/auth/logout` | Logout | Yes |
| GET | `/api/v1/auth/me` | Current user info | Yes |

### Products
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/products` | List products | Any |
| GET | `/api/v1/products/{id}` | Get product | Any |
| POST | `/api/v1/products` | Create product | Admin |
| PUT | `/api/v1/products/{id}` | Update product | Admin |
| DELETE | `/api/v1/products/{id}` | Delete product | Admin |
| PATCH | `/api/v1/products/{id}/status` | Update status | Admin |

### GraphQL
| Endpoint | Description |
|----------|-------------|
| POST `/graphql` | GraphQL queries |
| GET `/graphiql` | GraphQL playground |

### Health
| Endpoint | Description |
|----------|-------------|
| `/health` | Health check |
| `/actuator/health` | Actuator health |

---

## API Documentation

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON
```
http://localhost:8080/v3/api-docs
```

---

## Running Tests

```bash
# All tests
mvn test

# Specific test class
mvn test -Dtest=AuthControllerIT

# With coverage report
mvn test jacoco:report
# View: target/site/jacoco/index.html

# Skip tests
mvn package -DskipTests
```

### Test Files
| File | Type |
|------|------|
| `AuthControllerIT.java` | Controller integration |
| `ProductControllerIT.java` | Controller integration |
| `GraphQLControllerTest.java` | GraphQL tests |
| `DashboardServiceTest.java` | Service unit test |

---

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | jdbc:postgresql://localhost:5432/nexus | Database URL |
| `DB_USER` | nexus | Database user |
| `DB_PASSWORD` | nexus123 | Database password |
| `JWT_SECRET` | (see application.yml) | JWT signing key |
| `JWT_EXPIRY` | 86400000 | Token expiry (ms) |

### application.yml
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/nexus}
    username: ${DB_USER:nexus}
    password: ${DB_PASSWORD:nexus123}

jwt:
  secret: ${JWT_SECRET:...}
  expiration: ${JWT_EXPIRY:86400000}
```

---

## Database

### Migrations
```bash
# Run migrations
mvn flyway:migrate

# Clean + migrate
mvn flyway:clean flyway:migrate
```

### Seed Data
```bash
psql -h localhost -U nexus -d nexus -f ../database/seeds/V999__demo_data.sql
```

---

## Building

```bash
# Development build
mvn clean package

# Production JAR
mvn clean package -Pprod

# Docker image
docker build -t nexus-backend .
```

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

---

## Technology Stack

| Technology | Version |
|------------|---------|
| Java | 17 |
| Spring Boot | 3.2.1 |
| PostgreSQL | 15 |
| Flyway | 10.0.1 |
| jjwt | 0.12.3 |
| springdoc-openapi | 2.3.0 |
| Lombok | managed |
| Testcontainers | 1.19.3 |

---

## Related Documentation

- [Development Guide](../docs/development-guide.md)
- [Testing Guide](../docs/testing-guide.md)
- [Implementation Plan](../docs/implementation-plan.md)

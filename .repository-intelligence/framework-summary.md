# Framework Summary — PostQode Nexus

## Primary Language
- **Backend**: Java 17
- **Frontend**: TypeScript
- **Mobile**: TypeScript

## Backend Framework
- **Spring Boot 3.2.1** (parent POM)
- **Spring Data JPA** — ORM and repository pattern
- **Spring Security** — JWT-based authentication
- **Spring Validation** — Bean validation
- **Spring Actuator** — Health and metrics endpoints
- **Flyway 10.0.1** — Database migrations
- **GraphQL Java Kickstart 15.0.0** — GraphQL API layer
- **OpenAPI/Swagger 2.3.0** — REST API documentation

## Frontend Framework
- **React 18.2.0** with Vite 7.3.0 build tool
- **React Router DOM 6.20.0** — Client-side routing
- **Tailwind CSS 3.3.5** — Utility-first styling
- **Radix UI primitives** — Accessible UI components (dialog, tabs, dropdown, etc.)
- **Zustand 4.4.7** — Lightweight state management
- **React Hook Form 7.70.0 + Zod 4.3.5** — Form handling and validation
- **Axios 1.6.2** — HTTP client
- **Recharts 2.10.3** — Charts and analytics
- **Sonner 1.7.4** — Toast notifications
- **Lucide React 0.294.0** — Icon library

## Mobile Framework
- **React Native 0.73.6** with Expo 50.0.0
- **React Navigation 6.x** — Stack + Bottom Tabs navigation
- **Zustand 4.4.7** — State management
- **Axios 1.6.2** — HTTP client
- **React Native Chart Kit 6.12.0** — Mobile charts
- **Lucide React Native 0.562.0** — Icons

## Testing Framework
- **Backend**: JUnit 5 (via Spring Boot Starter Test), Testcontainers (PostgreSQL)
- **Frontend**: Vitest 4.1.4, React Testing Library, jsdom
- **Mobile**: Jest 29.7.0 (jest-expo preset), React Native Testing Library

## Build System
- **Backend**: Maven (root POM + backend module POM)
- **Frontend**: Vite (npm scripts: dev, build, test, preview)
- **Mobile**: Expo CLI (npm scripts: start, android, ios, test)

## Dependency Injection
- **Backend**: Spring IoC container (constructor injection standard)
- **Frontend**: React Context (AuthContext) + Zustand stores
- **Mobile**: Zustand stores

## Common Libraries
- **Axios** — Shared HTTP client across frontend and mobile
- **Zustand** — Shared state management pattern across frontend and mobile
- **JWT** — Token-based auth (jjwt 0.12.3 on backend)

## Framework Conventions
- **Backend**: Layered architecture — Controller → Service → Repository → Entity
- **Frontend**: Feature-based page components in `src/pages/`, shared components in `src/components/`, services in `src/services/`
- **Mobile**: Screen components in `src/screens/`, shared components in `src/components/`, navigation in `src/navigation/`
- **Database**: Flyway migrations in `backend/src/main/resources/db/migration/`, seeds in `database/seeds/`

## Confidence
- **High** — All versions and conventions extracted directly from pom.xml and package.json files

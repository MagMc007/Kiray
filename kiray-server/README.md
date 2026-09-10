# Kiray — Backend REST API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat&logo=docker&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-SDK-FFCA28?style=flat&logo=firebase&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-SDK-3448C5?style=flat&logo=cloudinary&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-Geocoding-000000?style=flat&logo=mapbox&logoColor=white)

A production-grade, high-performance REST API powering **Kiray** — a peer-to-peer property rental platform designed to eliminate middlemen, brokers, and unnecessary transaction friction by connecting property owners directly with house seekers through map-first discovery and verified reviews.

---

## Table of Contents

1. [Project Overview & Philosophy](#project-overview--philosophy)
2. [Tech Stack](#tech-stack)
3. [System Architecture: Layered Architecture](#system-architecture-layered-architecture)
4. [Core Features & Functional Modules](#core-features--functional-modules)
   - [Authentication & Identity Management](#1-authentication--identity-management)
   - [Property Listings & Geospatial Discovery Engine](#2-property-listings--geospatial-discovery-engine)
   - [User Engagements & Rating Engine](#3-user-engagements--rating-engine)
   - [Administrative Control Plane & Moderation](#4-administrative-control-plane--moderation)
5. [API Documentation](#api-documentation)
6. [Data Models & Indexing Architecture](#data-models--indexing-architecture)
7. [Caching & Performance Strategy](#caching--performance-strategy)
8. [Security, Input Validation & Observability](#security-input-validation--observability)
9. [Environment Configuration Reference](#environment-configuration-reference)
10. [Getting Started & Local Development](#getting-started--local-development)
11. [Docker Deployment](#docker-deployment)
12. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Project Overview & Philosophy

Traditional real estate and rental marketplaces are burdened by prohibitive broker commissions, opaque pricing, disconnected communication channels, and centralized payment bottlenecks.

**Kiray** re-engineers rental discovery with a clean, decentralized philosophy:

- **Zero Broker Fees & Commissions**: Connects landlords directly with rentees.
- **Direct Contact Model**: Eliminates proprietary in-app messaging silos. Landlords expose verified contact channels (phone, WhatsApp, email), enabling fast, frictionless real-world discussions.
- **Geospatial & Map-First Discovery**: Housing is location-dependent; rentees browse listings directly through map bounding boxes and radius proximity searches.
- **Trust Through Transparency**: Real-time listing availability states, verified property badges, per-listing star ratings, and community moderation flags.

---

## Tech Stack

The backend is built with modern ES Modules (ESM) and an enterprise-grade technology ecosystem:

| Layer                       | Technologies & Badges                                                                                                                                                                                            | Purpose                                                                               |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Runtime & Web Framework** | ![NodeJS](https://img.shields.io/badge/Node.js_v20+-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)          | Asynchronous non-blocking runtime utilizing Express 5 with native promise support     |
| **Database & ODM**          | ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose_v9-880000?style=flat&logo=mongoose&logoColor=white)      | Document persistence with `2dsphere` geospatial indexing and schema modeling          |
| **Caching Layer**           | ![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?style=flat&logo=redis&logoColor=white)                                                                                                                | In-memory distributed caching with automatic invalidation and `ioredis-mock` fallback |
| **Authentication**          | ![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?style=flat&logo=firebase&logoColor=black)                                                                                                     | Secure token verification and multi-provider identity sync                            |
| **Cloud Media & Storage**   | ![Cloudinary](https://img.shields.io/badge/Cloudinary-SDK-3448C5?style=flat&logo=cloudinary&logoColor=white) ![Multer](https://img.shields.io/badge/Multer-Storage-FF6C37?style=flat&logo=files&logoColor=white) | Multi-part image processing, automated cloud storage, and responsive asset transforms |
| **Geospatial & Maps**       | ![Mapbox](https://img.shields.io/badge/Mapbox-Geocoding-000000?style=flat&logo=mapbox&logoColor=white)                                                                                                           | Forward/reverse coordinates resolution and location validation                        |
| **Validation & Schema**     | ![Zod](https://img.shields.io/badge/Zod-v4-3E67B1?style=flat&logo=zod&logoColor=white)                                                                                                                           | Type-safe runtime schema parsing and payload sanitization                             |
| **Security & Hardening**    | ![Helmet](https://img.shields.io/badge/Helmet-v8-4B32C3?style=flat&logo=shield&logoColor=white) ![RateLimit](https://img.shields.io/badge/Express_Rate_Limit-v8-blueviolet?style=flat)                           | Security HTTP headers, NoSQL query sanitization, and tiered endpoint rate limiting    |
| **Observability & Logging** | ![Pino](https://img.shields.io/badge/Pino-Structured_JSON-68A063?style=flat&logo=pino&logoColor=white)                                                                                                           | Low-overhead JSON request logging with credential/authorization header redaction      |
| **API Documentation**       | ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=flat&logo=swagger&logoColor=black)                                                                                                      | Live interactive endpoint documentation served via `/docs`                            |
| **Testing Harness**         | ![Jest](https://img.shields.io/badge/Jest-v30-C21325?style=flat&logo=jest&logoColor=white) ![Supertest](https://img.shields.io/badge/Supertest-v7-FF7800?style=flat)                                             | Unit, integration, security, and cache invalidation automated test suite              |
| **Containerization**        | ![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat&logo=docker&logoColor=white)                                                                                                        | Multi-stage Docker packaging and Docker Compose orchestration                         |

---

## System Architecture: Layered Architecture

The Kiray backend strictly follows the classic **Layered Architecture** pattern (N-Tier Architecture with Controller-Service-Repository separation). This ensures separation of concerns, high testability, and clean decoupling between protocol transports (HTTP/Express) and core domain business rules.

```
                      [ Incoming HTTP Client Requests ]
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Security & Middleware   │
                        │ (Helmet, CORS, Pino HTTP, │
                        │ RateLimiter, MongoSanitize│
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Routing Layer           │
                        │ (src/routes/ - Express 5) │
                        └─────────────┬─────────────┘
                                      │
                         [ Auth & Zod Validation ]
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Controller Layer        │
                        │   (src/controllers/)      │
                        │  (Thin HTTP Adapters)     │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Service Layer           │
                        │    (src/services/)        │
                        │ (Pure Business Logic,     │
                        │  Geo Queries, Aggregators)│
                        └───────┬──────────────┬────┘
                                │              │
            ┌───────────────────┘              └──────────────────┐
            ▼                                                     ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐
│    Persistence & Cache      │               │     External Services       │
│  (src/models/ Mongoose ODM, │               │  (Firebase Admin SDK,       │
│   src/config/redis.js)      │               │   Cloudinary, Mapbox)       │
└─────────────────────────────┘               └─────────────────────────────┘
```

### Architectural Tiers Breakdown

| Architectural Tier                | Directory Path                                                                                                                           | Responsibility                                                                                                                                                                                                           |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Presentation & Routing**     | [`src/routes/`](file:///c:/PROJECTS/Kiray/kiray-server/src/routes/)                                                                      | Defines REST endpoints, HTTP methods, route parameter bindings (`router.param`), and versioned router mounting (`/api/v1`).                                                                                              |
| **2. Middleware & Cross-Cutting** | [`src/middleware/`](file:///c:/PROJECTS/Kiray/kiray-server/src/middleware/)                                                              | Executes pre-controller processing: Helmet security headers, CORS policies, tiered rate limiters, Pino HTTP logging, Firebase token verification, and Zod schema validation.                                             |
| **3. Controller (HTTP Boundary)** | [`src/controllers/`](file:///c:/PROJECTS/Kiray/kiray-server/src/controllers/)                                                            | **Thin adapters**: Unpacks HTTP parameters (`req.body`, `req.query`, `req.params`), invokes the corresponding Service methods, and formats responses via standard JSON builders. Contains no business or database logic. |
| **4. Service (Core Domain)**      | [`src/services/`](file:///c:/PROJECTS/Kiray/kiray-server/src/services/)                                                                  | **Heart of the system**: Pure business logic, geospatial distance calculations, rating aggregations, listing availability transitions, and automated Redis cache invalidation. Decoupled from Express `req`/`res`.       |
| **5. Data & Persistence**         | [`src/models/`](file:///c:/PROJECTS/Kiray/kiray-server/src/models/), [`src/config/`](file:///c:/PROJECTS/Kiray/kiray-server/src/config/) | Mongoose 9 ODM schemas, custom validators, `2dsphere` geospatial indexes, compound indices, soft-delete filters, and Redis caching clients.                                                                              |
| **6. External Adapters**          | [`src/config/`](file:///c:/PROJECTS/Kiray/kiray-server/src/config/), [`src/utils/`](file:///c:/PROJECTS/Kiray/kiray-server/src/utils/)   | Third-party integrations: Firebase Admin SDK (authentication), Cloudinary (image processing & storage), and Mapbox (geocoding).                                                                                          |

### Architectural Design Rules

1. **Unidirectional Dependency Flow**: Dependencies strictly flow top-down: `Routes -> Middleware -> Controllers -> Services -> Models`. Controllers never call models directly; they must communicate via services.
2. **Standardized Responses**: Every successful response conforms to `{ success: true, message: string, data: any }` via [`sendSuccess`](file:///c:/PROJECTS/Kiray/kiray-server/src/utils/apiResponse.js).
3. **Typed Error Hierarchy**: Services throw typed error instances (`NotFoundError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`) that propagate directly to the global error handler middleware.
4. **Soft Deletion Pattern**: Critical entities (`Listing`, `User`, `Comment`) employ soft deletes (`isDeleted: true`, `deletedAt`), preventing accidental data loss while allowing administrative restoration or automated policy-based purging.

---

## Core Features & Functional Modules

### 1. Authentication & Identity Management

- **Firebase Auth Bridge**: Uses Firebase Admin SDK to verify client Bearer ID tokens.
- **Account Synchronization**: Automated profile synchronization via `/api/v1/auth/sync`, provisioning MongoDB user records upon first sign-in.
- **Role-Based Access Control (RBAC)**: Enforces role permissions across three user classes:
  - `rentee`: General user profile, ability to search, bookmark listings, and post listing comments.
  - `landlord`: Property owner able to create, update, manage, and monitor property listings.
  - `admin`: Full administrative access to the platform governance engine.

### 2. Property Listings & Geospatial Discovery Engine

- **Geospatial Proximity Search**: Leverages MongoDB `2dsphere` indexes to perform spherical `$near` and `$geoWithin` searches based on coordinate tuples `[longitude, latitude]`.
- **Compound Filtering**: Real-time filtering by price bounds (`minPrice`, `maxPrice`), room counts (`bedrooms`, `bathrooms`), property category (`apartment`, `house`, `villa`, `condo`, `studio`, `room`, `other`), square footage, and amenities array.
- **SEO-Optimized URL Slugs**: Auto-generates unique, collision-resistant slug identifiers (`slugify`) for human-readable URLs.
- **Cloudinary Media Pipeline**: Direct multi-part image uploads (up to 6 high-res photos per listing) stored on Cloudinary with eager transformations and thumbnail optimization.
- **Listing Lifecycle Machine**: Manage listing availability states:
  - `open`: Visible in search results and map views.
  - `rented`: Temporarily unlisted as rented.
  - `unavailable`: Marked off-market by owner or suspended by administrators.

### 3. User Engagements & Rating Engine

- **Saved Listings (Favorites)**: Compound-indexed user-to-listing relationship allowing users to bookmark properties.
- **Per-Listing Reviews**: Verified comments and numerical ratings (1–5 stars).
- **Dynamic Rating Aggregation**: Atomic calculation and caching of `averageRating` and `reviewCount` directly on the listing document whenever reviews are posted, edited, or deleted.
- **Impression & Engagement Metrics**: Rate-protected increment counters for total listing views and owner contact clicks (`incrementContactClick`).

### 4. Administrative Control Plane & Moderation

The backend includes a dedicated, role-protected control plane (`/api/v1/admin`) divided into 6 functional modules:

- **Module 1 — Operational Metrics & Analytics**: Aggregated system counts, user growth trajectories, listing metrics, and 30-day activity timelines.
- **Module 2 — User Lifecycle Management**: Paginated user inspection, administrative status suspension (`active` / `suspended`), role modification, and account restoration.
- **Module 3 — Listing Governance & Verification**: Administrative listing overrides, verification badges (`isVerified: true`), featured promotions (`isFeatured: true`), and hard-delete capabilities.
- **Module 4 — Content Moderation**: Citizen reporting pipeline (`Report` entity). Admins review reported content queues and execute resolution actions (`dismiss`, `deactivate`, `restore`).
- **Module 5 — Security Compliance & Audit Trail**: Immutable logging (`AuditLog`) of all administrative actions with actor metadata, IP addresses, and previous/new diffs. Includes GDPR-compliant user data package export.
- **Module 6 — System Maintenance**: Dynamic runtime toggles for system-wide maintenance mode, new user registration toggling, maximum listings per landlord caps, and automated purging of aged soft-deleted entities.

---

## API Documentation

The complete, interactive API specification is dynamically generated and served via **Swagger UI** using OpenAPI 3.0 standards:

- **Interactive Swagger UI**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Health Check Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

### What is Documented in Swagger UI

All REST endpoints are documented directly in source code using JSDoc annotations (`src/routes/**/*.js`, `src/controllers/**/*.js`, and `src/app.js`) and compiled automatically via `swagger-jsdoc`:

- **Complete Schema Definitions**: Request bodies, response envelopes, query filters, and pagination parameters.
- **Authentication**: Bearer token authorization header setup for Firebase JWTs.
- **Error Responses**: Detailed documentation of RFC-standard status codes, Zod validation failure matrices, and error payload structures.
- **Interactive Testing**: Execute live requests against all modules directly from the browser:
  - `/api/v1/auth` (User synchronization & profile extraction)
  - `/api/v1/users` (Profile management, contact channels & user listings)
  - `/api/v1/listings` (Geospatial search, CRUD, media uploads, favorites & status toggles)
  - `/api/v1/listings/:id/comments` (Reviews, star ratings & sentiment)
  - `/api/v1/admin/*` (Analytics dashboard, user moderation, audit compliance logs & system maintenance)

---

## Data Models & Indexing Architecture

The persistence layer uses Mongoose 9 models backed by targeted MongoDB indexes:

| Entity         | Primary Fields                                                                                                                                         | Key Indexes & Optimizations                                                                                                                                                                      |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`User`**     | `firebaseUid`, `email`, `role`, `displayName`, `phone`, `whatsapp`, `status`, `isDeleted`                                                              | • Unique sparse index on `firebaseUid`<br>• Compound filter index: `{ status: 1, isDeleted: 1 }`                                                                                                 |
| **`Listing`**  | `title`, `slug`, `price`, `propertyType`, `location` (GeoJSON), `address`, `status`, `images`, `averageRating`, `viewsCount`, `saveCount`, `isFlagged` | • Geospatial: `2dsphere` on `location`<br>• Unique index on `slug`<br>• Text index on `title`, `description`, `address.city`<br>• Compound search index: `{ status: 1, isDeleted: 1, price: 1 }` |
| **`Comment`**  | `listingId`, `userId`, `rating` (1–5), `comment`, `isDeleted`                                                                                          | • Compound index on `{ listingId: 1, createdAt: -1 }`<br>• Soft-delete index on `{ isDeleted: 1 }`                                                                                               |
| **`Favorite`** | `userId`, `listingId`, `createdAt`                                                                                                                     | • Compound unique index on `{ userId: 1, listingId: 1 }` preventing duplicate bookmarks                                                                                                          |
| **`Report`**   | `listingId`, `reporterId`, `reason`, `category`, `status` (`pending`, `reviewed`, `dismissed`)                                                         | • Compound index: `{ listingId: 1, status: 1 }`                                                                                                                                                  |
| **`AuditLog`** | `actorId`, `action`, `targetType`, `targetId`, `ipAddress`, `metadata`, `createdAt`                                                                    | • Index on `{ createdAt: -1 }`<br>• Compound index: `{ targetType: 1, targetId: 1 }`                                                                                                             |

---

## Caching & Performance Strategy

Kiray implements a high-throughput caching tier via Redis to minimize database read pressure on frequently queried routes:

```
[ Client Request ] ──► [ Cache Middleware ] ──► (Cache Hit?) ──► [ Return Cached JSON ]
                               │
                          (Cache Miss)
                               │
                               ▼
                    [ Execute Service Query ]
                               │
                               ▼
                  [ Store in Redis with TTL ] ──► [ Return Response ]
```

### Cache TTL Tiers

| Cache Key Pattern    |            TTL Duration            | Invalidation Triggers                                                        |
| :------------------- | :--------------------------------: | :--------------------------------------------------------------------------- |
| `listings:query:*`   | 60 seconds (`REDIS_TTL_LISTINGS`)  | Creating, updating, deleting, or altering the status of any listing          |
| `listings:detail:*`  |            300 seconds             | Updating listing information, photo gallery modifications, or status toggles |
| `comments:listing:*` | 120 seconds (`REDIS_TTL_COMMENTS`) | Posting, updating, or deleting a review on that listing                      |

### Fallback Mechanism

If a standalone Redis instance is unavailable or connection drops, the application smoothly degrades by utilizing an in-memory `ioredis-mock` instance, ensuring zero server crashes during offline development or Redis outages.

---

## Security, Input Validation & Observability

### Multi-Tier Defense

- **HTTP Security Headers**: Powered by `helmet()` to enforce CSP, HSTS, frameguard, and XSS filtering.
- **NoSQL Injection Defense**: Sanitizes user-supplied payloads using `express-mongo-sanitize`, backed by a custom Express 5 query descriptor polyfill.
- **Tiered Rate Limiting**:
  - `globalLimiter`: 100 requests per 15-minute window for standard endpoints.
  - `authLimiter`: Strict threshold for `/api/v1/auth/*` to mitigate brute-force attempts.
  - `uploadLimiter`: Specialized cap for file and image upload endpoints.

### Strict Input Validation with Zod

All request payloads, query strings, and route parameters are strongly validated through declarative Zod schemas (`validators.js`). Payloads containing illegal types or missing required fields are rejected immediately with structured error metadata before hitting controllers.

### Structured Observability

- **Pino & Pino-HTTP**: High-performance JSON logging with request duration benchmarking.
- **Automatic Token Redaction**: Authorization headers and credentials are automatically scrubbed from request logs (`[REDACTED]`).
- **Request Correlation**: Automatically tracks request IDs, client IP addresses, and authenticated user IDs on every log entry.

---

## Environment Configuration Reference

Create a `.env` file in the root of `kiray-server` based on `.env.example`:

| Environment Variable       | Required | Description                                      | Example / Default                               |
| :------------------------- | :------: | :----------------------------------------------- | :---------------------------------------------- |
| `PORT`                     | Optional | Server port                                      | `5000`                                          |
| `NODE_ENV`                 | Optional | Environment mode                                 | `development` / `production`                    |
| `LOG_LEVEL`                | Optional | Pino logging threshold                           | `info` / `debug` / `warn`                       |
| `API_VERSION`              | Optional | API prefix version tag                           | `v1`                                            |
| `MONGODB_URI`              | **Yes**  | MongoDB Atlas or local connection string         | `mongodb://localhost:27017/Kiray`               |
| `FIREBASE_SERVICE_ACCOUNT` | **Yes**  | Firebase service account credentials JSON string | `{"type":"service_account","project_id":"..."}` |
| `CLOUDINARY_CLOUD_NAME`    | **Yes**  | Cloudinary account name                          | `your_cloud_name`                               |
| `CLOUDINARY_API_KEY`       | **Yes**  | Cloudinary API key                               | `your_api_key`                                  |
| `CLOUDINARY_API_SECRET`    | **Yes**  | Cloudinary API secret                            | `your_api_secret`                               |
| `MAPBOX_ACCESS_TOKEN`      | Optional | Mapbox token for server-side geocoding           | `pk.eyJ1...`                                    |
| `REDIS_URL`                | Optional | Redis connection URL                             | `redis://localhost:6379`                        |
| `REDIS_TTL_LISTINGS`       | Optional | Cache TTL for listing searches in seconds        | `60`                                            |
| `REDIS_TTL_COMMENTS`       | Optional | Cache TTL for listing reviews in seconds         | `120`                                           |
| `ADMIN_EMAIL`              | Optional | Default admin email for bootstrapping            | `admin@example.com`                             |
| `ADMIN_PASSWORD`           | Optional | Default admin password for bootstrapping         | `change-me`                                     |

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI
- **Redis**: (Optional) Local Redis instance or container

### 1. Clone and Install Dependencies

```bash
cd kiray-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Open .env and fill in your MongoDB, Firebase, and Cloudinary keys
```

### 3. Start Development Server

```bash
npm run dev
```

The server will initialize at `http://localhost:5000` with hot-reload enabled via Nodemon.

### 4. Verify System Health

Visit [http://localhost:5000/health](http://localhost:5000/health) or browse the interactive documentation at [http://localhost:5000/docs](http://localhost:5000/docs).

---

## Docker Deployment

The application includes a multi-stage `Dockerfile` and a `docker-compose.yml` configuration:

### Run via Docker Compose (Server + Redis)

```bash
docker-compose up -d
```

This orchestrates:

- `api`: Node.js server running on port `5000`
- `redis`: Redis server running on port `6379` with persistent volume storage

### Standalone Docker Build & Run

```bash
# Build Docker image
npm run docker:build

# Run container with environment configuration
npm run docker:run
```

---

## Testing & Quality Assurance

Kiray incorporates an automated test harness built with **Jest** and **Supertest**, containing 35+ test suites covering:

- Security hardening (Helmet, rate limiters, NoSQL sanitization)
- Authentication and role-based access authorization
- Geospatial radius search and compound filtering
- Listing CRUD lifecycle, slugification, and Cloudinary media processing
- Review aggregation and bookmark counter caches
- Redis cache hits, misses, and automated invalidation triggers
- Complete administrative control plane and moderation resolution workflows

### Running Tests

```bash
# Run all test suites with coverage report
npm test

# Run CI test runner with force-exit on completion
npm run test:ci
```

Coverage summaries and reports are output directly to terminal and saved to the `/coverage` directory.

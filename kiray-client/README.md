# Kiray Frontend

[![Next.js](https://img.shields.io/badge/Next.js-v15-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-v2-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Mapbox GL](https://img.shields.io/badge/Mapbox_GL-v3-000000?style=flat&logo=mapbox&logoColor=white)](https://docs.mapbox.com/mapbox-gl-js)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-v3-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev)

The production-grade **Next.js 15** frontend for **Kiray**, a peer-to-peer property rental platform built to eliminate middlemen and connect property owners directly with house seekers through map-first discovery, verified reviews, and frictionless direct contact.

---

## Table of Contents

1. [Project Overview & Philosophy](#project-overview--philosophy)
2. [Tech Stack](#tech-stack)
3. [System Architecture: Feature-Sliced Design](#system-architecture-feature-sliced-design)
4. [Core Features & Functional Modules](#core-features--functional-modules)
   - [Authentication & Session Management](#1-authentication--session-management)
   - [Map-First Listing Discovery](#2-map-first-listing-discovery)
   - [Listing Browsing, Search & Detail](#3-listing-browsing-search--detail)
   - [Landlord Dashboard & Listing Management](#4-landlord-dashboard--listing-management)
   - [Rentee Dashboard & Favorites](#5-rentee-dashboard--favorites)
   - [Comments & Ratings](#6-comments--ratings)
   - [Administrative Control Plane](#7-administrative-control-plane)
   - [Internationalization (i18n)](#8-internationalization-i18n)
5. [State Management & Data Fetching](#state-management--data-fetching)
6. [Routing & Page Map](#routing--page-map)
7. [Environment Configuration Reference](#environment-configuration-reference)
8. [Getting Started & Local Development](#getting-started--local-development)
9. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Project Overview & Philosophy

The Kiray frontend is purpose-built to eliminate the friction that traditional rental marketplaces impose on tenants and landlords alike. Every architectural and UX decision is guided by three core principles:

- **Map-First Discovery**: Housing is inherently location-dependent. The primary browsing experience anchors on an interactive Mapbox GL map, enabling rentees to visually explore neighborhoods, pin listings by proximity, and search by geographic bounding box not just text.
- **Direct Contact, Zero Friction**: Landlords expose real-world contact channels (phone, WhatsApp, email) directly on listing pages. There are no in-app messaging silos, scheduling bottlenecks, or broker intermediaries.
- **Role-Driven UX**: The interface adapts entirely to the authenticated user's role `rentee`, `landlord`, or `admin` surfacing only the features and dashboards that are relevant to them, powered by a Firebase-backed identity layer synchronized with the backend's RBAC system.

---

## Tech Stack

| Layer                     | Technologies                                  | Purpose                                                                                    |
| :------------------------ | :-------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Framework**             | Next.js 15, React 19                          | App Router with Server Components, file-based routing, and React 19 concurrent features    |
| **Language**              | TypeScript 5                                  | End-to-end static typing across components, API contracts, and state slices                |
| **State & Data Fetching** | Redux Toolkit v2, RTK Query                   | Global state management with RTK Query for server-state caching and automatic invalidation |
| **Authentication**        | Firebase Client SDK v12                       | Multi-provider sign-in (email/password, Google), Firebase ID token lifecycle management    |
| **Maps & Geospatial**     | Mapbox GL JS v3                               | Interactive map rendering, listing pin clusters, and proximity-based search                |
| **Styling**               | Tailwind CSS v4, tailwind-merge               | Utility-first styling with conditional class composition                                   |
| **Animations**            | Motion v12                                    | Declarative UI animations, page transitions, and micro-interactions                        |
| **Forms & Validation**    | React Hook Form v7, Zod v4                    | Performant uncontrolled forms with Zod schema resolvers for client-side validation         |
| **Charts & Analytics**    | Recharts v3                                   | Admin dashboard analytics: user growth, listing metrics, and activity timelines            |
| **Icons**                 | Lucide React                                  | Consistent, tree-shakeable icon system                                                     |
| **Typography**            | Plus Jakarta Sans, Outfit, Noto Sans Ethiopic | UI, display, and Amharic i18n font support via Google Fonts                                |
| **Media**                 | Cloudinary, Next.js Image                     | Optimized image delivery with remote pattern whitelisting                                  |
| **Internationalization**  | Custom LanguageContext                        | English / Amharic language switching with context-based translation provider               |
| **Testing**               | Vitest v3, @testing-library/react             | Component unit tests and integration tests with jsdom                                      |
| **Code Quality**          | ESLint v9, Prettier                           | Enforced code style and lint rules via eslint-config-next                                  |

---

## System Architecture: Feature-Based Design

The Kiray frontend is organized around **Feature-Sliced Design (FSD)** a disciplined, scalable front-end architecture that co-locates each domain's API layer, state slice, and UI components within a single feature directory. This prevents cross-feature coupling, makes ownership boundaries explicit, and enables independent iteration on each product area.

```
  [ Browser / User ]
         |
         v
+-------------------------------------------------+
|            Next.js 15 App Router                |
|   src/app/ - Pages, Layouts, Route Groups       |
|   (Server Components + Client Boundaries)       |
+-------------------+-----------------------------+
                    |
                    v
+-------------------------------------------------+
|           Feature Slices (src/features/)        |
|  +----------+  +----------+  +--------------+  |
|  |  auth/   |  |listings/ |  |    admin/    |  |
|  |  slice   |  |  slice   |  |    slice     |  |
|  |  api     |  |  api     |  |    api       |  |
|  |  hooks   |  |  hooks   |  |  components  |  |
|  |  comps   |  |  comps   |  |              |  |
|  +----------+  +----------+  +--------------+  |
|  [ map / comments / favorites / users / ... ]   |
+-------------------+-----------------------------+
                    |
                    v
+-------------------------------------------------+
|         Redux Store  (src/store/)               |
|  +---------------------------------------+      |
|  |  baseApi (RTK Query)                  |      |
|  |  - Firebase ID token injection        |      |
|  |  - Tag-based cache invalidation       |      |
|  |  - Backend envelope unwrapping        |      |
|  +---------------------------------------+      |
|  authSlice | listingsSlice                      |
+-------------------+-----------------------------+
                    |  HTTP  (Bearer JWT)
                    v
       [ Kiray REST API - kiray-server ]
```

### Architectural Tiers Breakdown

| Tier                            | Directory Path    | Responsibility                                                                                                                                                    |
| :------------------------------ | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. App Router & Pages**       | `src/app/`        | Next.js 15 App Router: page components, nested layouts, route groups `(auth)`, and the root layout with font provisioning, metadata, and the Redux provider tree. |
| **2. Feature Slices**           | `src/features/`   | Nine self-contained feature modules. Each owns its RTK Query API definition, Redux slice (if stateful), hooks, and co-located UI components.                      |
| **3. Global State & API**       | `src/store/`      | RTK Query `baseApi` (shared base query with auth headers), Redux `store` configuration, and typed `useAppDispatch` / `useAppSelector` hooks.                      |
| **4. Shared Component Library** | `src/components/` | Reusable, design-system-level primitives (`Button`, `Input`, `Modal`, `Badge`, `Skeleton`, `UserAvatar`) and layout chrome (`Navbar`, `Footer`, `Logo`).          |
| **5. Utilities & Validation**   | `src/lib/`        | Pure utility functions: number/date formatters, app-wide constants, Zod validation schemas shared between form resolvers and API input shaping.                   |
| **6. TypeScript Contracts**     | `src/types/`      | Shared TypeScript interfaces and types for API responses, domain entities (`Listing`, `User`, `Comment`, `Report`, `AuditLog`), and Redux state shapes.           |
| **7. Internationalization**     | `src/i18n/`       | `LanguageContext` React context provider, translation files for English and Amharic, and typed translation key definitions.                                       |

### Architectural Design Rules

1. **Feature-level Colocation**: Each feature slice (`src/features/<name>/`) owns its own API definitions, state slice, and UI components. Cross-feature imports are minimized and flow only through the shared layers (`src/components/`, `src/lib/`, `src/types/`).
2. **Unidirectional Data Flow**: UI components read from Redux selectors or RTK Query hooks → dispatch actions or trigger mutations → `baseApi` communicates with the backend → cache is invalidated via tags → components re-render with fresh data.
3. **Backend Envelope Normalization**: All RTK Query `transformResponse` handlers call `unwrapApiResponse<T>()` to strip the backend's `{ success, message, data }` envelope, exposing clean domain types to consumers.
4. **Client / Server Boundary**: Server Components are used for layouts and static shells. All interactive components maps, forms, dashboards are Client Components (`'use client'`), ensuring hydration boundaries are deliberate and minimal.
5. **Auth as Infrastructure**: Firebase auth state is managed globally by `useAuthListener`, mounted once in `Providers`. Auth tokens are injected into every RTK Query request transparently via `prepareHeaders` in `baseApi`, requiring no per-component token handling.

---

## Core Features & Functional Modules

### 1. Authentication & Session Management

- **Firebase Client SDK**: Handles sign-up (email/password, Google OAuth) and sign-in flows through the `auth` feature slice.
- **`useAuthListener` Hook**: A singleton effect hook (`AuthListenerBootstrap`) mounted in the root `Providers` that subscribes to `onAuthStateChanged`. On sign-in, it retrieves the Firebase ID token, dispatches `setCredentials` to the Redux `authSlice`, and automatically syncs the MongoDB user profile via `authApi.endpoints.getMe`.
- **Redux `authSlice`**: Persists `firebaseUid`, `idToken`, `currentUser` (MongoDB profile), and `status` (`idle` | `loading` | `authenticated` | `unauthenticated`) as global state. Exposes typed selectors: `selectCurrentUser`, `selectIsLandlord`, `selectIsAdmin`, `selectIsRentee`, `selectIsProfileCompleted`.
- **Role-Based Routing**: Dashboard layouts (`/dashboard/landlord`, `/dashboard/rentee`) and the admin section (`/admin`) enforce role guards at the layout level. Unauthenticated users are redirected to `/login`.
- **Token Refresh**: The `baseApi` `prepareHeaders` function first reads the `idToken` from Redux; if absent (e.g. after a page reload), it falls back to `getCurrentIdToken()` to force-refresh the Firebase token, ensuring requests always carry a valid Bearer credential.

### 2. Map-First Listing Discovery

- **Mapbox GL JS v3**: The primary browsing surface on `/listings` renders an interactive Mapbox GL map displaying listing pins across the city.
- **Geospatial Search**: The map feature calls `getNearbyListings` (proximity radius search) and `searchListings` (bounding-box + filter queries) against the backend's geospatial engine, surfacing results as GeoJSON pin layers.
- **Synchronized List & Map Views**: The listings page maintains a split-panel layout map on one side, card list on the other. Hovering or selecting a card highlights the corresponding pin on the map and vice versa, driven by the `listingsSlice` selected listing state.

### 3. Listing Browsing, Search & Detail

- **`QuickSearchBar`**: A prominent top-of-page search control supporting keyword, location, price range, and property type quick filters.
- **`AdvancedFilterPanel`**: An expandable side panel offering granular compound filtering: `minPrice`/`maxPrice`, `bedrooms`, `bathrooms`, `propertyType` (`apartment`, `house`, `villa`, `condo`, `studio`, `room`, `other`), square footage, and amenity checkboxes. All filter state is serialized into URL query parameters for deep-linkable, shareable search results.
- **`ListingCard`**: A rich media card displaying primary photo, price, title, location badge, availability status, and average star rating.
- **`/listings/[slug]` Detail Page**: Full listing detail view including:
  - **`ListingGallery`**: Full-screen photo carousel with Cloudinary-optimized images.
  - **`ListingInfo`**: Structured property attributes, amenities, and listing lifecycle status.
  - **`OwnerProfileCard`**: Landlord contact channels (phone, WhatsApp, email) displayed directly on the page with contact-click impression tracking.
  - **Similar Listings**: Automatically populated via `getSimilarListings`.
  - **Engagement Metrics**: View count incremented automatically on page load via `trackView` mutation.

### 4. Landlord Dashboard & Listing Management

- **`/dashboard/landlord`**: Role-protected dashboard page providing landlords with a full management surface for their property portfolio.
- **`MyListingsTable`**: A data table listing all of the landlord's properties with inline actions: edit, change status (`open` → `rented` → `unavailable`), restore soft-deleted listings, and delete.
- **`ListingForm`**: A comprehensive multi-step form (React Hook Form + Zod) handling all listing attributes title, description, property type, price, address, amenities, geolocation coordinate picking, and multi-image upload. Supports both **create** and **edit** modes.
- **Image Management**: Landlords upload up to 6 photos per listing via `uploadListingImages` (multipart FormData), with individual image deletion via `deleteListingImage`. Images are stored on Cloudinary and delivered via the backend.
- **Listing Limit Awareness**: `useLandlordListingLimit` hook reads the system-configured maximum listings per landlord from the backend and prevents form submission if the cap is reached.

### 5. Rentee Dashboard & Favorites

- **`/dashboard/rentee`**: Role-protected dashboard for tenants displaying bookmarked listings and account settings.
- **Saved Listings (Favorites)**: Rentees can bookmark any listing from the card or detail page. Favorites are managed through the `favorites` feature slice, with add/remove mutations that automatically invalidate the `Favorite` cache tag.

### 6. Comments & Ratings

- **Per-Listing Reviews**: Authenticated users can submit star ratings (1–5) and written comments on any listing detail page, managed via the `comments` feature's `commentsApi`.
- **Real-Time Rating Display**: `averageRating` and `reviewCount` are read directly from the listing document (kept in sync by the backend's aggregation engine) and displayed on both listing cards and the detail page.
- **Edit & Delete**: Users can edit or delete their own reviews; cache tag invalidation (`Comment`, `Listing`) ensures the rating display updates immediately.

### 7. Administrative Control Plane

The `/admin` section is a fully protected, role-gated control plane accessible only to users with the `admin` role. It is divided into dedicated sub-modules mirroring the backend's admin API:

| Admin Module              | Route               | Capability                                                                                                           |
| :------------------------ | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| **Dashboard & Analytics** | `/admin`            | Recharts-powered visualizations: user growth, listing counts, 30-day activity timelines                              |
| **User Management**       | `/admin/users`      | Paginated user table, role modification, account suspension (`active` / `suspended`)                                 |
| **Listing Governance**    | `/admin/listings`   | Administrative listing overrides, verification badge (`isVerified`) and featured (`isFeatured`) toggles, hard-delete |
| **Content Moderation**    | `/admin/flagged`    | Citizen report queue review with `dismiss`, `deactivate`, and `restore` resolution actions                           |
| **Audit Logs**            | `/admin/audit-logs` | Immutable chronological log of all administrative actions with actor metadata and IP addresses                       |
| **System Configuration**  | `/admin/system`     | Runtime toggles: maintenance mode, registration lock, max listings per landlord cap                                  |

### 8. Internationalization (i18n)

- **Custom `LanguageContext`**: A React context provider wrapping the application that exposes the current locale (`en` / `am`) and a `t()` translation function.
- **English & Amharic**: Translation dictionaries are maintained in `src/i18n/translations/`, with typed keys defined in `src/i18n/types.ts` to enforce coverage.
- **`LanguageSwitcher`**: A UI control in the Navbar allowing users to toggle between languages at runtime without a page reload.
- **Font Support**: `Noto Sans Ethiopic` is loaded via Google Fonts and scoped to Amharic content, ensuring correct rendering of Ethiopic script.

---

## State Management & Data Fetching

### RTK Query `baseApi`

All server communication is centralized through a single RTK Query `baseApi` instance. Feature slices extend it via `baseApi.injectEndpoints()`, keeping endpoint definitions co-located with their feature while sharing the same underlying cache and middleware.

```
[ Feature Slice API ]  .injectEndpoints()
         |
         v
+--------------------------------------------------+
|                   baseApi                        |
|  baseUrl: NEXT_PUBLIC_API_URL                    |
|  prepareHeaders:                                 |
|    1. Read idToken from Redux authSlice          |
|    2. Fallback: getCurrentIdToken() (Firebase)   |
|    3. Set Authorization: Bearer <token>          |
|    4. Set Accept: application/json               |
|  Dev mode: Surface X-Cache header in console     |
+--------------------------------------------------+
```

### Tag-Based Cache Invalidation

RTK Query's tag system enables precise, automatic cache invalidation. The full tag registry is:

| Tag Type       | Invalidated By                                                                   |
| :------------- | :------------------------------------------------------------------------------- |
| `Listing`      | `updateListing`, `deleteListing`, `updateListingStatus`, image mutations         |
| `ListingList`  | `createListing`, `updateListing`, `deleteListing`, status/availability mutations |
| `Comment`      | `createComment`, `updateComment`, `deleteComment`                                |
| `Favorite`     | `addFavorite`, `removeFavorite`                                                  |
| `User`         | `updateProfile`, `updateContactChannels`                                         |
| `AdminUser`    | Admin role/status modification mutations                                         |
| `AdminListing` | Admin listing governance mutations                                               |
| `Flag`         | Report resolution mutations (`dismiss`, `deactivate`, `restore`)                 |
| `AuditLog`     | Any admin action that generates a new log entry                                  |
| `SystemConfig` | System configuration update mutations                                            |

### Error Normalization

The `normalizeApiError()` utility maps all backend error envelopes including Zod validation failure `details[]` arrays and `429` rate-limit responses to a uniform `ApiError` shape (`{ status, message, details? }`) consumed consistently across all feature slice error handlers.

### Redux Slices

| Slice           | State                                                                 | Purpose                                                                  |
| :-------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `authSlice`     | `firebaseUid`, `idToken`, `currentUser`, `status`, `error`            | Manages the full Firebase → backend auth lifecycle and user profile      |
| `listingsSlice` | Local UI state for the listings page (selected listing, map viewport) | Drives the synchronized map <=> card-list interaction on the browse page |

---

## Routing & Page Map

The application uses Next.js 15's **App Router** with file-based routing:

| Route                          | Page                                   | Access        | Description                                                  |
| :----------------------------- | :------------------------------------- | :------------ | :----------------------------------------------------------- |
| `/`                            | `src/app/page.tsx`                     | Public        | Landing page with hero, feature highlights, and trust ribbon |
| `/login`                       | `src/app/(auth)/login/`                | Public        | Firebase email/password and Google sign-in                   |
| `/register`                    | `src/app/(auth)/register/`             | Public        | Account creation with role selection (rentee / landlord)     |
| `/listings`                    | `src/app/listings/page.tsx`            | Public        | Map + card list split view with advanced search & filtering  |
| `/listings/[slug]`             | `src/app/listings/[slug]/`             | Public        | Full listing detail: gallery, info, owner card, reviews      |
| `/dashboard/landlord`          | `src/app/dashboard/landlord/`          | Landlord only | Portfolio management, MyListingsTable, listing form          |
| `/dashboard/landlord/listings` | `src/app/dashboard/landlord/listings/` | Landlord only | Create / edit listing via ListingForm                        |
| `/dashboard/rentee`            | `src/app/dashboard/rentee/`            | Rentee only   | Saved listings (favorites) and account settings              |
| `/profile`                     | `src/app/profile/`                     | Authenticated | User profile management and contact channel configuration    |
| `/admin`                       | `src/app/admin/page.tsx`               | Admin only    | Analytics dashboard with Recharts visualizations             |
| `/admin/users`                 | `src/app/admin/users/`                 | Admin only    | User lifecycle management (roles, suspension)                |
| `/admin/listings`              | `src/app/admin/listings/`              | Admin only    | Listing governance (verification, featured, hard-delete)     |
| `/admin/flagged`               | `src/app/admin/flagged/`               | Admin only    | Content moderation report queue and resolution               |
| `/admin/audit-logs`            | `src/app/admin/audit-logs/`            | Admin only    | Immutable admin action audit trail                           |
| `/admin/system`                | `src/app/admin/system/`                | Admin only    | Runtime system configuration toggles                         |

---

## Environment Configuration Reference

Create a `.env.local` file in the root of `kiray-client` based on `.env.example`:

| Environment Variable               | Required | Description                                      | Example / Default              |
| :--------------------------------- | :------: | :----------------------------------------------- | :----------------------------- |
| `NEXT_PUBLIC_API_URL`              | **Yes**  | Base URL for the Kiray REST API                  | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | **Yes**  | Firebase Web API key                             | `AIzaSy...`                    |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **Yes**  | Firebase Auth domain                             | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | **Yes**  | Firebase project identifier                      | `your-project-id`              |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | **Yes**  | Firebase Web App ID                              | `1:123456789:web:abc...`       |
| `NEXT_PUBLIC_MAPBOX_TOKEN`         | **Yes**  | Mapbox GL JS public access token                 | `pk.eyJ1...`                   |
| `NEXT_PUBLIC_CLOUDINARY_TOKEN`     | Optional | Cloudinary public upload token (unsigned preset) | `your_upload_preset`           |
| `NEXT_PUBLIC_SITE_URL`             | Optional | Canonical site URL used for Open Graph metadata  | `http://localhost:3000`        |

> All variables are prefixed with `NEXT_PUBLIC_` and are safe to expose to the browser. No server-only secrets are held in the frontend.

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- A running instance of **kiray-server** (see `../kiray-server/README.md`)
- A Firebase project with **Email/Password** and **Google** sign-in providers enabled
- A Mapbox account with a valid public access token

### 1. Install Dependencies

```bash
cd kiray-client
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your Firebase, Mapbox, and API URL values
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` with Next.js Fast Refresh enabled.

### 4. Additional Scripts

```bash
# Type-check the entire codebase without emitting
npm run type-check

# Lint all files with ESLint
npm run lint

# Format all files with Prettier
npm run format

# Full CI pipeline: type-check -> lint -> test -> build
npm run ci
```

---

## Testing & Quality Assurance

The frontend uses **Vitest** and **@testing-library/react** with a `jsdom` environment, providing component-level unit tests and integration tests for core feature slices.

### Running Tests

```bash
# Run all test suites once
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch

# Full CI pipeline (type-check + lint + test + build)
npm run ci
```

### Test Coverage

Tests are located in `tests/` and cover:

- Redux `authSlice` state transitions (`setCredentials`, `logout`, `resetAuth`)
- RTK Query `baseApi` tag invalidation and cache behavior
- Feature-level form validation schemas (Zod)
- UI component rendering and interaction (listing cards, filters, modals)

Test configuration is defined in `vitest.config.ts` with global setup in `vitest.setup.ts`.

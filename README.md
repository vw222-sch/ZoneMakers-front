# ZoneMakers-front

## Overview

This document explains the frontend architecture for the ZoneMakers platform. The `ZoneMakers-front` app is a React/TypeScript client that connects UI interactions to a backend API.

The frontend provides:

- zone discovery, search, and detail browsing
- post creation, replies, and feeds
- profile, badge, and travel log management
- reporting, support ticket submission, and admin moderation flows

I designed this project as the presentation layer in a multi-service system: it handles routing, UI state, and HTTP communication while the backend owns persistence and authorization.

## Related Documentation

- [Backend API Documentation](https://github.com/vw222-sch/ZoneMakers-back) - Details on the backend services and API endpoints

## Key Responsibilities

This frontend is responsible for:

- rendering zone, post, and profile workflows
- managing authenticated user sessions and settings
- orchestrating post, report, and support ticket flows
- exposing admin views for zone approvals, user reports, and badge management
- abstracting API calls into reusable service wrappers

## System Context

- `src/lib/api.ts` is the shared Axios client, including base URL, timeout, request headers, and response handling.
- `src/services/` contains the domain-specific service wrappers for backend endpoints.
- `src/pages/` contains the route-level page components and layout logic.
- `src/components/` contains reusable UI components and primitives used across pages.

## Explanation of structure

I organized the repository around clear layers:

- `src/main.tsx` bootstraps the React app and initializes routing.
- `src/pages/` groups page views for main, admin, and auth sections.
- `src/components/` holds reusable UI components and shared presentation logic.
- `src/services/` is the API boundary for all network requests.
- `src/lib/` contains shared utilities, the Axios client, and auth helpers.
- `src/types/` defines shared TypeScript models for API responses and domain objects.

## UI Behavior

The UI follows these conventions:

- route-based pages render different content based on authentication and role
- loading and error states are managed locally in components when fetching data
- form submissions go through service calls and then refresh UI state on success

## Environment Variables

The application requires the following environment variables to be set in a `.env` file in the root directory:

- `VITE_MAPBOX_TOKEN`: Mapbox access token for map functionality
- `VITE_WORLD_NEWS_API_KEY`: API key for world news integration

Example `.env` file:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_WORLD_NEWS_API_KEY=your_news_api_key_here
```

These variables are used for map rendering and news features respectively.
- admin workflows are protected and only dispatched through admin-specific endpoints
- components consume typed service data rather than making raw API calls directly

## User Interactions

The app supports the following interaction patterns:

- navigation through routes, cards, and menus with primary entry points in `Chat`, `Home`, `Map`, `Support`, and admin dashboards
- direct actions such as posting, reporting, or profile updates that trigger service calls and update local state
- immediate UI feedback for loading, success, and failure conditions
- upfront validation in the UI where possible, with backend validation errors surfaced as user-friendly messages

## State Management

I kept state handling purposefully simple:

- local component state is used for form values, loading indicators, and transient UI state
- shared app state (especially auth/session state) is managed through React Context in `src/hooks/AuthContext.tsx`
- service calls return data that components use to update local or context state
- the project avoids a large global store by keeping state close to the components that own it

## Inputs & Outputs

The frontend communicates with the backend through typed service functions.

- `src/lib/api.ts` provides helpers: `apiGet`, `apiPost`, `apiPatch`, `apiPut`, and `apiDelete`
- service modules serialize request payloads and deserialize response payloads
- most service functions return domain objects such as `User`, `ApiPost`, `BadgeData`, `ZoneSummary`, and `ZoneFull`

### Request payloads

- `authService.signup()` sends `{ username, email, password, region }`
- `postService.createPost()` sends new post payloads to `/posts`
- `userService.updateUser*()` sends patch payloads like `{ target_id, new_name }`
- `zoneService.createZoneRequest()` sends zone request data to `/zones/requests`

### Response data

- Axios responses are typed by service functions, so components receive typed `res.data`
- `src/lib/api.ts` normalizes error payloads through `getErrorMessage`
- responses typically contain JSON entities, arrays for collections, or status-only responses for deletes

## Internal Logic

The app is built around a shared Axios client and lightweight service wrappers.

- `src/lib/api.ts` initializes Axios with a base URL, 30-second timeout, and a request interceptor for auth tokens
- service modules define endpoint paths, payload shapes, and response types for the UI
- page components and views consume service functions directly, keeping business logic separate from presentation
- `src/lib/api.ts` handles `401` responses by calling `logout()`, and `getErrorMessage` converts errors into readable strings
- service layers normalize response data when necessary, such as parsing zone coordinate strings into arrays

### Important decisions

- prefer typed service wrappers over direct Axios calls to centralize API contracts
- keep page components focused on rendering and UI state
- normalize backend data at the service boundary to avoid leaking raw API formats into the UI

## External Dependencies

This project depends on the following external libraries and services:

- `axios` for HTTP requests from `src/lib/api.ts`
- `vite` for dev server and build tooling
- `react` / `react-dom` for UI rendering
- `pnpm` as the recommended package manager
- a backend API service for authentication, zone data, posts, reports, and admin actions

## Usage Example

Below is a common usage pattern for components that consume service functions:

```tsx
import { useEffect, useState } from 'react';
import { fetchPosts } from '@/services/postService';
import type { ApiPost } from '@/types';

export function RecentPosts() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(1, 1)
      .then(data => setPosts(data))
      .catch(err => setError(err.message ?? 'Unable to load posts'));
  }, []);

  return (
    <section>
      {error && <p>{error}</p>}
      {posts.map(post => (
        <article key={post.id}>{post.content}</article>
      ))}
    </section>
  );
}
```

## Edge Cases & Error Handling

I highlighted the main failure modes and the intended handling:

- network failures and server errors should be handled in components with `.catch()` or `try/catch`
- `src/lib/api.ts` treats `401` responses specially and triggers `logout()` for expired auth
- service layers normalize invalid backend formats before returning data to the UI
- delete/update endpoints often return no payload, so components should refresh state based on success rather than response data
- if response parsing fails, the UI should log the error and display a friendly message instead of raw server output

## Security Considerations

This frontend assumes the backend is the primary authority for security.

- validate user input in the UI before calling services
- do not expose privileged endpoints directly; backend authorization must be enforced there
- avoid storing sensitive data like passwords or raw tokens in local storage
- normalize and sanitize API responses before rendering them in the UI
- use HTTPS for production API traffic and ensure `VITE_API_URL` is configured securely

## Scalability Notes

The frontend is intentionally lightweight, so scalability concerns are mostly around API load and browser rendering.

- large datasets should be paged or lazy-loaded for posts, reports, and travel logs
- service wrappers are synchronous; consider caching or memoization for frequently requested read-only data
- the app assumes a moderate number of concurrent users and delegates heavy processing to the backend
- component rendering should remain optimized to avoid loading all data at once

## Notes / Improvements

I recommend the following future improvements:

- add a central error boundary or toast system to standardize UI failure handling
- audit service payload shapes for consistency, especially around `target_id`
- introduce shared API contract types if backend schemas evolve
- extract repeated request/response logic into reusable hooks or a generic service layer

## Quick Start

```bash
pnpm install
pnpm dev
```

Make sure `VITE_API_URL` points to the backend API before running locally.

# ZoneMakers-front

## Overview

This document explains the frontend architecture for the ZoneMakers platform. The `ZoneMakers-front` app is a React/TypeScript client that connects UI interactions to a backend API. The application is live at **[https://zonemakers.netlify.app/](https://zonemakers.netlify.app/)**.

## Prerequisites

- Node.js 22.x or higher
- `pnpm` is the recommended package manager (project includes `pnpm-lock.yaml`)
- If `pnpm` is not available, `npm` can be used as a fallback via `npx`

The frontend provides:

- interactive map discovery with safe/unsafe zone visualization
- post creation, replies, and regional chat feeds
- user profiles, badge management, and travel log tracking
- news feed integration from world news sources
- reporting, support ticket submission, and admin moderation panels
- notifications for user interactions and system updates
- region-based community chat

I designed this project as the presentation layer in a multi-service system: it handles routing, UI state, and HTTP communication while the backend owns persistence and authorization.

## Related Documentation

- [Backend API Documentation](https://github.com/vw222-sch/ZoneMakers-back) - Details on the backend services and API endpoints

## Key Responsibilities

This frontend is responsible for:

- rendering zone, post, profile, and travel log workflows
- managing authenticated user sessions and user settings
- orchestrating post, report, and support ticket flows
- providing region-based chat and community interaction
- displaying world news feed and notifications
- exposing admin views for zone approvals, user/post/zone reports, badge management, and user search
- abstracting API calls into reusable service wrappers

## System Context

- `src/lib/api.ts` is the shared Axios client, including base URL, timeout, request headers, and response handling.
- `src/services/` contains domain-specific service wrappers for backend endpoints:
  - `authService.ts` - login, signup, logout
  - `userService.ts` - user profile, avatar, banner, bio, email, handle, password, theme, region updates
  - `postService.ts` - create, read, update, delete posts and post replies
  - `zoneService.ts` - zone discovery, zone requests, zone details
  - `badgeService.ts` - badge management and user badge assignment
  - `notificationService.ts` - user notifications and read status
  - `reportService.ts` - user, post, and zone reports
  - `supportService.ts` - support tickets and admin support management
  - `travelService.ts` - travel log management
  - `adminService.ts` - admin-specific operations
- `src/pages/` contains the route-level page components and layout logic.
- `src/components/` contains reusable UI components and primitives used across pages.
- `src/hooks/AuthContext.tsx` manages global authentication state and user session.

## Explanation of structure

I organized the repository around clear layers:

- `src/main.tsx` bootstraps the React app and initializes routing with BrowserRouter and AuthProvider.
- `src/pages/` groups page views into three sections:
  - `main/` - primary public pages: Home, Map, Chat, News, Support, Notifications
  - `side/` - auth and profile pages: Login, Signup, UserDetails, and Chatroom (region-specific chat)
  - `admin/` - admin dashboards: AdminLayout, AdminSupport, AdminZones, AdminZoneReports, AdminUserReports, AdminPostReports, AdminUserSearch, AdminBadgeManager
- `src/components/` holds reusable UI components in `shared/` (Navbar, Footer) and `ui/` (buttons, inputs, etc.)
- `src/services/` is the API boundary for all network requests, organized by domain (auth, user, post, zone, etc.)
- `src/lib/` contains shared utilities, the Axios client, and auth helpers.
- `src/types/` defines shared TypeScript models for API responses and domain objects.
- `src/hooks/` contains custom React hooks, especially AuthContext for global state.

## UI Behavior

The UI follows these conventions:

- **Routing structure**: `/chat` displays a region selector, then navigates to `/chat/:regionId` for region-specific chat rooms
- route-based pages render different content based on authentication and role (user or admin)
- authenticated routes check token validity via AuthContext and redirect to login if needed
- loading and error states are managed locally in components when fetching data
- form submissions go through service calls and then refresh UI state on success or display errors
- admin routes require admin role verification before displaying protected content

## Environment Variables

The application requires the following environment variables to be set in a `.env` file in the root directory for local development:

- `VITE_API_URL`: base URL for the backend API (defaults to `http://localhost:3000` for local development)
- `VITE_MAPBOX_TOKEN`: Mapbox access token for map functionality (required for Map page)
- `VITE_WORLD_NEWS_API_KEY`: API key for world news integration (required for News page)

**`.env` file:**
```
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_WORLD_NEWS_API_KEY=your_news_api_key_here
```

**Production deployment** (https://zonemakers.netlify.app/):
- Environment variables are configured in Netlify's deployment settings
- API requests are proxied to the backend service
- All external API tokens are managed securely in the deployment platform

## Test Profiles:
- **Admin** username: admin ; password: admin
- **User** username: teszt ; password: teszthash

## User Interactions

The app supports the following interaction patterns:

- **Primary navigation** through main pages: Home (landing), Map (zone visualization), Chat (region-based communities), News (world news feed), Support (tickets), Notifications (alerts)
- **Profile flows** - users can sign up, log in, view user details, and manage badges and travel logs
- **Zone interactions** - view safe/black zones on map, create zone requests, submit zone reports
- **Post interactions** - create posts, reply to posts, view regional post feeds, report posts
- **Chat interactions** - select region from chat page, then participate in region-specific chatrooms
- **Admin dashboards** (access-controlled) - manage zones, handle reports (user/post/zone), search users, grant/revoke badges, manage support tickets
- **Direct actions** such as posting, reporting, or profile updates that trigger service calls and update local state
- **Immediate UI feedback** for loading, success, and failure conditions
- **Upfront validation** in the UI where possible, with backend validation errors surfaced as user-friendly messages

## State Management

I kept state handling purposefully simple:

- **Component state** - local form values, loading indicators, and transient UI state live in useState
- **Global auth state** - user session, authentication status, and user profile are managed through React Context in `src/hooks/AuthContext.tsx`
- **Service calls** return data that components use to update local or context state
- **No global store** - the project avoids Redux or similar by keeping state close to the components that own it
- **Token persistence** - auth tokens are typically stored in localStorage or memory, with automatic refresh on 401 responses from the API

## Inputs & Outputs

The frontend communicates with the backend through typed service functions.

- `src/lib/api.ts` provides helpers: `apiGet`, `apiPost`, `apiPatch`, `apiPut`, and `apiDelete`
- service modules serialize request payloads and deserialize response payloads
- most service functions return domain objects such as `User`, `ApiPost`, `BadgeData`, `ZoneSummary`, and `ZoneFull`

### Request payloads

- `authService.signup()` sends `{ username, email, password, region }`
- `authService.login()` sends `{ email, password }`
- `postService.createPost()` sends post content to `/posts`
- `postService.replyToPost()` sends reply payloads with post ID reference
- `userService.updateUserHandle()`, `updateUserName()`, etc. send patch payloads like `{ new_handle }`, `{ new_name }`, etc.
- `zoneService.createZoneRequest()` sends zone request data with region and coordinates
- `reportService.reportUser()`, `reportPost()`, `reportZone()` send report metadata and reason
- `badgeService.grantBadge()` sends user ID and badge ID for admin operations

### Response data

- **Typed responses** - Axios responses are typed by service functions, so components receive typed `res.data` with full IDE autocomplete
- **Error normalization** - `src/lib/api.ts` normalizes error payloads through `getErrorMessage()` to provide user-friendly error strings
- **Response formats** - responses typically contain JSON entities (single object), arrays for collections, or status-only responses for DELETE operations
- **Status codes** - `200/201` for success, `4xx` for client errors (surfaced to UI), `401` triggers auto-logout, `5xx` for server errors

## Internal Logic

The app is built around a shared Axios client and lightweight service wrappers.

- `src/lib/api.ts` initializes Axios with a base URL, 30-second timeout, and a request interceptor for auth tokens
- service modules define endpoint paths, payload shapes, and response types for the UI
- page components and views consume service functions directly, keeping business logic separate from presentation
- `src/lib/api.ts` handles `401` responses by calling `logout()`, and `getErrorMessage` converts errors into readable strings
- service layers normalize response data when necessary, such as parsing zone coordinate strings into arrays

### Important decisions

- **Typed service wrappers** - prefer service functions over direct Axios calls to centralize API contracts and make changes easier to track
- **Component locality** - keep page components focused on rendering and UI state, move business logic to service layers
- **Data normalization at boundaries** - normalize backend data at the service layer (e.g., parsing zone coordinates) to avoid leaking raw API formats into the UI
- **Region-based chat hierarchy** - use separate routes (/chat vs /chat/:regionId) to distinguish between region selection and room participation
- **Context for global state** - use AuthContext instead of a large store to keep the codebase lightweight and focused

## External Dependencies

This project depends on the following external libraries and services:

- **HTTP**: `axios` for HTTP requests from `src/lib/api.ts`
- **Build tooling**: `vite` for dev server and build optimization, `typescript` for type checking
- **UI framework**: `react` / `react-dom` for UI rendering, `react-router-dom` for routing
- **Styling**: `tailwindcss` with `@tailwindcss/vite` for utility-first CSS, `lucide-react` for icons
- **UI components**: `@radix-ui` for accessible component primitives, custom components in `src/components/ui/`
- **Maps**: `mapbox-gl` and `maplibre-gl` for map rendering, `react-map-gl` for React integration, `@mapbox/mapbox-gl-draw` for drawing on maps
- **Animation**: `motion` for smooth animations across the UI
- **Utilities**: `clsx` for className composition, `class-variance-authority` for component variants, `vaul` for drawer/dialog primitives
- **Testing**: `vitest` for unit tests, `@testing-library/react` for component testing
- **Linting**: `eslint` for code quality checks
- **External services**: 
  - Mapbox API for map tiles and geocoding
  - World News API for news feed content
  - Backend API service for all data operations

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

- **Centralized error handling** - add a global error boundary or toast notification system to standardize UI failure messaging across all pages
- **API contract consistency** - audit service payload shapes for consistency, especially around naming conventions (e.g., `target_id` vs direct ID parameters)
- **Data caching strategy** - consider implementing React Query or similar to cache API responses and reduce redundant requests
- **Component composition** - extract repeated form patterns (especially in admin dashboards) into reusable form builders
- **Accessibility audit** - ensure all interactive elements are keyboard-navigable and screen-reader friendly, especially for maps and real-time chat
- **Performance optimization** - consider virtualization for large lists (reports, user searches, zone requests) and image optimization for banners
- **TypeScript strictness** - enable strict mode in tsconfig if not already enabled to catch more type errors at build time
- **Testing coverage** - expand test suite beyond the existing Home.test.tsx to cover critical user flows (auth, posting, reporting)

## Quick Start

### Local Development

```bash
pnpm install
pnpm dev
```

Make sure `VITE_API_URL` points to the backend API before running locally (defaults to `http://localhost:3000`).

If `pnpm` is unavailable, you can use `npm`:

```bash
npm install
npm run dev
```

### Production Build

```bash
pnpm build
```

This builds the app for production to the `dist/` folder. The app is automatically deployed to **[https://zonemakers.netlify.app/](https://zonemakers.netlify.app/)** on commits to the main branch.

## Validation & Testing

Use the following commands to verify the frontend build and tests:

```bash
# Type checking
npx tsc -b

# Linting
npm run lint

# Run tests
npm run test

# Watch tests during development
npm run test:watch

# Preview production build locally
npm run preview
```

All checks should pass before submitting pull requests.

## Deployment

The frontend is deployed to **[Netlify](https://www.netlify.com/)** at **[https://zonemakers.netlify.app/](https://zonemakers.netlify.app/)**.

### Deployment Process

- Commits to the `main` branch trigger an automatic build and deployment
- Netlify runs the `npm run build` command to create a production bundle
- The `dist/` folder is served as the static site
- Environment variables are configured in Netlify's dashboard under Site Settings > Build & Deploy > Environment

### Accessing the Live Site

Visit **[https://zonemakers.netlify.app/](https://zonemakers.netlify.app/)** to see the live application with all features accessible:
- Interactive map with zone discovery
- Regional chat communities
- World news feed
- User profiles and badges
- Support tickets and admin dashboards (for authorized users)

### Troubleshooting Deployment

- If the build fails, check the Netlify build logs for TypeScript or ESLint errors
- Ensure all environment variables (`VITE_API_URL`, `VITE_MAPBOX_TOKEN`, `VITE_WORLD_NEWS_API_KEY`) are set in Netlify
- Verify the backend API is reachable from the production URL
- Check browser console for CORS or API connectivity issues

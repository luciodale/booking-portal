# Broker feature folder structure

Broker features (e.g. `property`, `pms`) share the same folder structure for consistency and onboarding. Follow this standard for any new broker feature under `src/features/broker/`.

## Goal

- Same top-level folders across broker features.
- Single source of truth for types, constants, and client API within each feature.
- Clear separation: API boundary, domain logic, operations, queries, routes, UI.

## Canonical layout

| Folder | Purpose |
|--------|--------|
| **api/** | API boundary: `client-server/` (one file per client call), `server-handler/` (one file per HTTP handler, GET/POST/PATCH/DELETE prefix), `types.ts` |
| **constants/** | Feature constants (query keys, status enums, integration ids) |
| **domain/** | Pure business logic: mappings, validation, transforms (no React, no DB, no fetch) |
| **integrations/** | One subfolder per external provider; each with `server-service/`, `ui/`, and provider-specific files |
| **operations/** | Server-only DB/API operations used by server-handler (e.g. insertXSQL) |
| **queries/** | React Query hooks; one file per hook (or small grouped files) |
| **routes/** | Route definitions (`createRoute`) and route-level components |
| **ui/** | Shared UI components for the feature |

## api/

- **client-server/**: One file per client call. Names like `queryX`, `getXById`, `createX`, `updateX`, `deleteX`. They call fetch (or wrap a shared client) and are used by `queries/` and UI.
- **server-handler/**: One file per HTTP handler. Names prefixed with method: `GETX`, `POSTX`, `PATCHX`, `DELETEX`. Export a single handler (e.g. `GET`, `POST`). Used by `pages/api/**` re-exports.
- **types.ts**: API request/response types for this feature (or re-exports from schemas). Single source of truth for API types.

## constants/

Query keys, status enums, integration/provider ids, route paths. Single source for feature constants.

## domain/

Pure logic only (mappings, validation, transforms). No React, no DB, no fetch. Testable in isolation.

## integrations/

One folder per external provider (e.g. smoobu). Each provider folder: `server-service/` (server-only API calls), `ui/` (provider-specific UI), plus files like `verifyApiKey.ts`, `createBodySchema.ts`.

## operations/

Server-only DB/API operations (e.g. insertXSQL) used by server-handler. No HTTP; just data layer.

## queries/

One file per React Query hook (or small group). Hook names like `useX`, `useCreateX`. Use `api/client-server` and optionally `constants/` for keys.

## routes/

TanStack Router route definitions and route-level components. Route files can live in the feature that owns the flow (e.g. create-property-from-listing in pms/routes).

## ui/

Shared feature components. Provider-specific UI lives under `integrations/{provider}/ui/`.

## Naming

- No default exports; named exports only.
- File names: camelCase for client-server and operations, PascalCase for React components, GET/POST/etc. for server-handler.

## Cross-feature routes

A route can have `getParentRoute: () => parentRoute` from another feature (e.g. pms/routes importing property/routes/broken). Document this dependency in the route file.

## One source of truth

- Types and constants in one place per feature.
- Client API in feature `api/client-server`; shared ui-api can re-export from there.

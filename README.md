# React Starter

A reusable Vite and React 19 foundation for client-side product applications. It includes strict TypeScript, Chakra UI v3, TanStack Router and Query, React Hook Form, Zod, i18next, Storybook, Biome, Vitest, and Playwright.

## Get started

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and set the values for this application.
3. Run `pnpm dev` and open `http://localhost:5173`.

`VITE_API_BASE_URL` configures the backend origin for API requests. Leave it empty
to use the same origin, or set it to the backend origin when the API is hosted
separately.

## Commands

- `pnpm dev` - start the development server.
- `pnpm validate` - run formatting/lint checks, TypeScript, unit tests, and a production build.
- `pnpm test:e2e` - run the Playwright browser suite.
- `pnpm storybook` - develop reusable components in isolation.
- `pnpm build-storybook` - build the static component catalogue.

## Project conventions

- Add product code under `src/features/<feature>`; each feature owns its API, types, schemas, mappers, services, hooks, and components.
- Keep `src/lib` infrastructure-focused and business-agnostic. Reusable primitives belong in `src/components/ui`; app-wide compositions belong in `src/components/shared`.
- Route modules belong in `src/routes`. Do not edit `src/routeTree.gen.ts`; the router plugin regenerates it.
- Use Chakra semantic tokens such as `bg.canvas`, `bg.panel`, `fg`, and `fg.muted` so every screen supports light and dark mode.
- Use `useTranslation` for visible and accessible application strings. Feature-owned translations should stay with the feature.

See `AGENTS.md` for the full architecture and contribution rules.
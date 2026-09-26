# Architecture Guidelines

## Structure

Use feature-based architecture. Business code belongs to the feature that owns it. Root `src/lib` is application infrastructure and generic utilities only; root `src/hooks` is only for generic hooks reusable across unrelated features. `src/components/ui` is for reusable UI primitives, while `src/components/shared` is for application-wide composed components. Do not create empty folders or abstractions before they are needed.

When applicable, a feature follows `src/features/<feature>/{api,components,hooks,mappers,schemas,services,types}`. `api` owns raw external communication and DTOs; `mappers` transform DTOs and domain models; `services` orchestrate business operations and should stay framework-independent; `hooks` provide React and React Query integration by calling services; `components` are feature presentation only.

## Required rules

1. Use feature-based architecture.
2. Business code belongs to the feature that owns it.
3. Never create root-level business types, mappers, schemas, or services.
4. Keep feature types inside `features/<feature>/types`.
5. Keep feature mappers inside `features/<feature>/mappers`.
6. Keep feature services inside `features/<feature>/services`.
7. Keep feature schemas inside `features/<feature>/schemas`.
8. Keep feature API code inside `features/<feature>/api`.
9. Keep feature React Query hooks inside `features/<feature>/hooks`.
10. Follow existing patterns before introducing new ones.
11. Do not add dependencies unless they solve a concrete requirement.
12. Keep business logic outside React components.
13. Components must not directly transform raw API DTOs.
14. Mappers handle transformations between external DTOs and domain models.
15. Services handle business operations and orchestration.
16. TanStack Query hooks call services rather than embedding business logic.
17. Validate external or untrusted data with Zod where appropriate.
18. Do not use `useEffect` for server data fetching.
19. Prefer local state over global state.
20. Avoid premature abstractions.
21. Prefer small composable components.
22. Avoid `any`.
23. Keep `lib/` infrastructure-focused and business-agnostic.
24. A feature should be removable without requiring major changes throughout unrelated features.
25. Do not create folders or abstractions until they are actually needed.

## State and imports

Use TanStack Query for server state, TanStack Router search parameters for URL state, React Hook Form for form state, and `useState` or `useReducer` for local UI state. Do not add a global-state library without a concrete requirement. Use the aliases `@/app/*`, `@/components/*`, `@/features/*`, `@/hooks/*`, and `@/lib/*`.
## UI, localization, and color mode

Use `src/components/ui` for small generic controls and `src/components/shared` for reusable application-wide compositions. Prefer Chakra semantic tokens such as `bg.canvas`, `bg.panel`, `bg.subtle`, `fg`, and `fg.muted`; do not introduce fixed light-only colors that break dark mode.

Localization infrastructure belongs in `src/lib/i18n`. Use `useTranslation` for application-owned visible and accessible strings. Keep feature-specific translation resources with the feature that owns them. Chakra color mode is provided through `AppProviders` with `next-themes`; do not create a parallel theme state.
## Component folders

Every reusable component lives in its own PascalCase folder under `src/components/ui` or `src/components/shared`. Keep the implementation as `<ComponentName>.tsx` and colocate its Storybook documentation as `<ComponentName>.stories.tsx`. Do not add barrel files solely to shorten imports.
## Theme tokens

The scalable theme is defined in `src/app/theme.ts`. Add or change project palette values there, then consume semantic tokens such as `bg.canvas`, `bg.panel`, `border`, `fg`, `fg.muted`, and the `brand` color palette in components. Do not scatter raw product colors through UI components. Both light and dark values must be defined for every new semantic token.
## Data lists and mapping boundaries

When a feature renders fetched records with `DataList`, create feature-owned listing components such as `ClientDataList.tsx` and `ClientDataListItem.tsx`; do not compose a feature’s rows directly in a route or unrelated shared component.

For each major backend resource, define both `<Entity>FromAPI` and `<Entity>` in the owning feature’s `types/` folder. Its feature mapper must export `map<Entity>FromAPI` and `map<Entity>ToAPI`; they may initially return `{ ...entity }`, but the mapper boundary must remain even when the shapes match.

Put only domain-independent mappers in `src/lib/mappers`. Use `mapDateToUI` and `mapDateToAPI` for generic date transport or presentation boundaries. Keep entity-specific DTO/domain transformations inside the feature’s `mappers/` folder.
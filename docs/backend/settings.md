# Settings API contract

## Resources

`UserProfile` is the lightweight identity displayed in the application shell.

```ts
type UserProfile = {
  displayName: string
  avatarUrl?: string
  bio?: string
}
```

`UserSettings` stores user-scoped presentation and planning defaults. It must not alter stored financial record currencies or historical timestamps.

```ts
type UserSettings = {
  timezone: string // IANA identifier, e.g. Africa/Casablanca
  locale: 'en' | 'fr'
  defaultCurrency: string // ISO 4217 uppercase code
  dateFormat: 'locale' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  weekStartsOn: 0 | 1
  theme: 'system' | 'light' | 'dark'
  planning: {
    dayStartHour: number
    dayEndHour: number
    defaultBlockMinutes: number
    timeIncrementMinutes: 5 | 10 | 15 | 30
  }
}
```

The API may return the combined frontend-friendly snapshot:

```json
{ "profile": { "displayName": "Chaker Asman" }, "settings": { "timezone": "Africa/Casablanca", "locale": "en", "defaultCurrency": "MAD", "dateFormat": "locale", "timeFormat": "24h", "weekStartsOn": 1, "theme": "system", "planning": { "dayStartHour": 7, "dayEndHour": 23, "defaultBlockMinutes": 60, "timeIncrementMinutes": 15 } } }
```

## Endpoints

- `GET /api/me` returns `UserProfile` plus account identity.
- `PATCH /api/me` accepts editable `displayName`, `avatarUrl`, and `bio`.
- `GET /api/me/settings` returns `UserSettings`.
- `PATCH /api/me/settings` accepts a partial `UserSettings` update and returns the saved resource.

Implementations may additionally offer `GET /api/me/preferences` as the combined profile/settings snapshot, but should keep the two resource boundaries above stable.

## Validation and semantics

- Display name is required (1–80 characters); bio is at most 280 characters; avatar must be a valid HTTPS/HTTP URL when supplied.
- `timezone` must be an IANA timezone identifier, never an abbreviation such as `WET` or `PST`.
- `defaultCurrency` must be a valid ISO 4217 currency code. It supplies defaults only to new finance/subscription records; changing it never converts historical data.
- `weekStartsOn` is `0` (Sunday) or `1` (Monday).
- Planner hours are whole local-time hours, `dayStartHour < dayEndHour`; increment is one of 5, 10, 15, or 30 minutes; default duration is positive and divisible by the selected increment.
- Absolute reminders and planner blocks are interpreted in the user’s configured timezone for display. Recurring reminders retain their intended local wall-clock time through DST/timezone changes; reliable delivery remains a server scheduling concern.
- Locale/date/time format are display preferences only and do not change persistence formats.

Use conventional validation errors such as `INVALID_TIMEZONE`, `INVALID_CURRENCY`, `INVALID_PLANNING_PREFERENCES`, `INVALID_PROFILE`, and `SETTINGS_NOT_FOUND`.

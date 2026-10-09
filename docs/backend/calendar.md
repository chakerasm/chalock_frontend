# Calendar aggregation contract

Calendar is a read-and-action projection of owned records. It never persists a `CalendarEvent` or duplicates entity data. A calendar entry carries its source type, source ID, date/time and action target only.

## Range reads

The Calendar requests only the visible range (including the padded days in a month grid). Planner and Tasks already accept `from/to` and `dueFrom/dueTo`. Reminders use `from/to`; Subscriptions use `renewsAfter/renewsBefore`; Goals should accept `from/to` against `targetDate`.

Finance should expose range filters for recurring transaction occurrences and savings-goal target dates when its list endpoints are backed by remote storage. Until then, the Calendar only requests those two finance resources and filters the small returned read models locally.

`GET /api/v1/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` aggregates authorized source references. It must not create a storage model: each result retains `sourceType`, `sourceId`, timing and source action metadata, and writes continue through the owning APIs.

Return either an item array or `{ "data": [...] }`. Each item has `id`, `sourceType` (`planner|task|reminder|goal|subscription|finance`), `sourceId`, `title`, timezone-aware ISO `start`, optional ISO `end`, `allDay`, and optional `status`. `from` and `to` are required local dates and must be validated with `CalendarQueryDto`; reject an inverted range.

# Planner API contract

> The recurrence contract below supersedes the original one-time-only endpoint
> details in this document.

## TimeBlock entity

A TimeBlock represents an intentional allocation on one local calendar day. The planner uses 15-minute increments in its UI, but the API validates the portable 24-hour `HH:mm` representation so the granularity can be configured later.

```json
{
  "id": "block-1",
  "title": "Deep Work",
  "description": "Implement planner timeline",
  "date": "2026-09-30",
  "startTime": "09:30",
  "endTime": "11:00",
  "taskId": "task_123",
  "goalId": "goal_456",
  "category": "focus",
  "status": "planned",
  "focusSessionId": "focus_789",
  "createdAt": "2026-09-30T08:00:00.000Z",
  "updatedAt": "2026-09-30T08:15:00.000Z"
}
```

`category` is optional and is one of `focus`, `work`, `personal`, `study`, `fitness`, `break`, `routine`, or `other`. `status` is `planned`, `in_progress`, `completed`, or `cancelled`. Completing a block does not complete its optional Task. `taskId`, `goalId`, and `focusSessionId` are optional references.

## Date, time, and timezone semantics

`date` is a local calendar date (`YYYY-MM-DD`) and `startTime`/`endTime` are local wall-clock times (`HH:mm`); they are deliberately not UTC instants. A block at `09:00` remains at 09:00 after a timezone change and must never shift into another planner day through ISO conversion. The authenticated user’s configured IANA timezone should be recorded or resolved by the server for authorization, display, and future notifications. Audit fields are UTC ISO-8601 instants.

`endTime` must be later than `startTime`; overnight blocks are out of scope for this daily MVP. Titles are required after trimming (1–120 chars); descriptions are optional (up to 2,000 chars). Supplied Task and Goal IDs must exist and be owned by the caller.

## Endpoints

`GET /api/time-blocks?date=2026-09-30` returns blocks for a day, ordered by start time. Weekly views use `GET /api/time-blocks?from=2026-09-30&to=2026-10-06`. Both filters are inclusive local dates.

`GET /api/time-blocks/:id` returns one owned block. `POST /api/time-blocks` creates from the writable entity fields and sets `id`, `status: "planned"`, and audit fields. `PATCH /api/time-blocks/:id` accepts a non-empty subset of writable fields plus a valid status transition. `DELETE /api/time-blocks/:id` returns `204`.

The backend should permit overlapping blocks and return an informational `conflicts` array when useful; it must not silently move or overwrite a block. `TIME_BLOCK_CONFLICT` is therefore advisory, not a hard error. When starting focus from a block, create the focus session through the Focus API with its `taskId` and `goalId`, then patch `focusSessionId` and optionally transition the block to `in_progress`.

Also pass `plannerBlockId` when starting Focus. Linked block projections may
show derived planned-versus-focused duration after the block ends. Moving a
block does not change its Task due date; completing a Task must not silently
delete future blocks (explicit cancellation is required).

Errors use `{ "code": "...", "message": "..." }`: `TIME_BLOCK_NOT_FOUND`, `INVALID_TIME_RANGE`, `TASK_NOT_FOUND`, `GOAL_NOT_FOUND`, `INVALID_DATE`, `TIME_BLOCK_CONFLICT`, and `INVALID_STATUS_TRANSITION`.

## Recurring Planner blocks

Planner is a local wall-clock calendar. `date`, `startsOn`, `endsOn`, and
`occurrenceDate` are ISO local dates (`YYYY-MM-DD`); `startTime` and `endTime`
are `HH:mm`. They are never converted through UTC. A series stores the user's
IANA `timezone`, so 19:30 remains 19:30 across daylight-saving transitions.
Audit fields remain UTC instants.

Use a `PlannerBlockSeries` plus small `PlannerOccurrenceException` records;
never persist hundreds of future blocks. A series owns normal TimeBlock fields,
optional `taskId`/`goalId`, recurrence, `startsOn`, end condition, timezone,
and audit fields. An exception has `seriesId`, `occurrenceDate`, a `cancelled`
or `modified` type, and only overridden fields.

```json
{
  "title": "Gym",
  "startTime": "19:30",
  "endTime": "20:30",
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "weekdays": [1, 3, 5],
    "startsOn": "2026-10-12",
    "ends": "never",
    "timezone": "Africa/Casablanca"
  }
}
```

`frequency` is `daily`, `weekly`, `monthly`, or `yearly`; `interval` is >= 1.
Weekdays use Sunday=0 through Saturday=6 (`[1,2,3,4,5]` is weekdays). Monthly
rules use `dayOfMonth` (month ends clamp) or `weekday` plus `weekOfMonth`
1..5 or -1 (last), supporting a first-Sunday review. `ends` is `never`,
`on_date` plus inclusive `endsOn`, or `after_occurrences` plus
`occurrenceCount`.

Day and week queries return one flattened TimeBlock shape for one-time and
generated blocks. Generated blocks add `seriesId`, `occurrenceDate`, and their
`recurrence`; cancelled exceptions are excluded and modified exceptions replace
their generated occurrence. Server generation must use timezone-aware calendar
operations, not fixed 24-hour millisecond arithmetic or UTC parsing of dates.

`POST /api/time-blocks` accepts optional `recurrence` and creates a series when
present. For a generated occurrence, `PATCH /api/time-blocks/:id` accepts
`occurrenceDate` and `scope`:

- `this`: create/update a modified exception only; use it to reschedule or
  change one duration.
- `future`: end the old series before the occurrence and create a successor
  series from it, preserving past history.
- `series`: update the series rule without silently changing historical data.

`DELETE /api/time-blocks/:id?occurrenceDate=...&scope=this|future|series`
uses the same scopes. `this` creates a cancelled exception (skip), `future`
ends the series before the selected day, and `series` deletes or archives the
series according to retention conventions. The UI must always choose a scope.

Validate recurrence bounds, inclusive end date, occurrence count, month/day
rules and IANA timezone. Use `INVALID_RECURRENCE`, `INVALID_TIMEZONE`, and
`OCCURRENCE_NOT_FOUND` in addition to the existing Planner errors.

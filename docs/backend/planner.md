# Planner API contract

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

Errors use `{ "code": "...", "message": "..." }`: `TIME_BLOCK_NOT_FOUND`, `INVALID_TIME_RANGE`, `TASK_NOT_FOUND`, `GOAL_NOT_FOUND`, `INVALID_DATE`, `TIME_BLOCK_CONFLICT`, and `INVALID_STATUS_TRANSITION`.

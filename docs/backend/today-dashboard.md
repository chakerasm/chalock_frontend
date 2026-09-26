# Today dashboard API contract

## Purpose and ownership

Today is a read model for “What do I need to do today?” It combines the authenticated user’s local-day tasks, scheduled habits, focus summary, active session, and a small set of active goals. The frontend currently uses browser MSW mocks only; this contract documents the future backend and does not request backend implementation.

Use `GET /api/dashboard/today` as an aggregated endpoint. The five source features should continue to own their writes, but a server-side aggregation avoids client waterfalls, gives one time-zone-consistent snapshot, and avoids showing a partially refreshed day.

## Entities and relationships

| Entity | Required fields | Rules and relationships |
| --- | --- | --- |
| Task | `id`, `title`, `status` | A task appears when it is unfinished, non-cancelled, and due on the local dashboard date or overdue. It can additionally have `dueTime`, `priority`, and `estimatedMinutes`. It is owned by the tasks feature. |
| Habit check-in | `id`, `name`, `completed` | Returned only when a habit is scheduled today. Count habits additionally have `currentCount` and `targetCount`; a check-in belongs to one habit and local date. |
| Focus session | `id`, `status`, `elapsedSeconds` | A user can have at most one `active` or `paused` session. An active session has `startedAt`; a paused one does not. See the Focus Sessions contract for the source entity. |
| Goal | `id`, `name`, `currentValue`, `targetValue` | Goals are owned by the goals feature. The dashboard returns a capped, ranked selection, never every goal. `targetDate` is optional. |
| Quick note | `id`, `content`, `createdAt` | Owned by the notes feature and captured from Today without navigation. |

## Aggregated read

### `GET /api/dashboard/today`

The server resolves “today” in the user’s configured IANA time zone. `date` is an ISO local calendar date, not a UTC timestamp.

```json
{
  "date": "2026-09-26",
  "tasks": [
    {
      "id": "task-1",
      "title": "Review project brief",
      "status": "todo",
      "dueTime": "09:30",
      "priority": "high",
      "estimatedMinutes": 45
    }
  ],
  "scheduledHabits": [
    {
      "id": "habit-1",
      "name": "Water",
      "completed": false,
      "currentCount": 5,
      "targetCount": 8
    }
  ],
  "focusSummary": {
    "completedMinutes": 50,
    "completedSessions": 2
  },
  "activeFocusSession": {
    "id": "focus-1",
    "status": "active",
    "elapsedSeconds": 0,
    "startedAt": "2026-09-26T08:35:00.000Z",
    "taskTitle": "Outline the project proposal"
  },
  "activeGoals": [
    {
      "id": "goal-1",
      "name": "Read 12 books this year",
      "currentValue": 7,
      "targetValue": 12,
      "targetDate": "2026-12-31"
    }
  ]
}
```

All arrays may be empty; `activeFocusSession` is `null` when there is no active session. `completedMinutes` and `completedSessions` include finished sessions only; the client adds active elapsed time while rendering. Return `401` for unauthenticated users, `403` for unavailable workspace data, `422` for an invalid user time zone, and `5xx` for aggregation failures. A partial resource failure must not silently produce a misleading complete day.

## Source-feature writes used by Today

### `POST /api/tasks`

Request: `{ "title": "Prepare the project update" }`.

`title` is trimmed, required, and 1–120 characters. Create a `todo` task and return it. A task is relevant to Today only when it has a due date of today or is overdue; see the Tasks contract for the complete creation semantics. Errors: `401`, `403`, `422`, `5xx`.

### `PATCH /api/tasks/:taskId`

Request: `{ "status": "completed" }`.

`status` is a task status enum. Only the task owner may update it; completing a task records `completedAt`, while moving to another status clears it. Return the updated task. Errors: `404` for absent or inaccessible task, `422` invalid payload, `409` if a business rule rejects the transition.

### `POST /api/habits/:habitId/check-ins`

Request: `{ "date": "2026-09-26", "action": "increment" }`.

`date` is an ISO local date; `action` is `complete` or `increment`. The habit must be scheduled that day. `increment` adds exactly one without exceeding `targetCount`; `complete` marks a binary habit or completes the count target. Use an idempotency key for retried writes. Errors: `404`, `409` invalid state/schedule, `422` malformed request.

### `POST /api/focus-sessions`

An empty object starts an active session at server time and returns it. A task action may optionally send `{ "taskTitle": "Review project brief" }` (1–120 trimmed characters) so the active session can show its context. Enforce one active session per user; return `409` with code `ACTIVE_FOCUS_SESSION` if one already exists.

### `PATCH /api/focus-sessions/:sessionId`

Request: `{ "status": "paused", "elapsedSeconds": 1523 }`.

`status` is `active` or `paused`; `elapsedSeconds` is a non-negative integer observation. The server is authoritative and must not let elapsed time decrease. Active sets `startedAt`; paused clears it. Errors: `404`, `409` invalid transition, `422` malformed request.

### `POST /api/notes`

Request: `{ "content": "Ask Maya about the research notes." }`.

`content` is trimmed, required, and 1–1,000 characters. Return `{ id, content, createdAt }`; `createdAt` is a UTC ISO timestamp. Errors: `401`, `403`, `422`, `5xx`.

## Persistence and integration rules

- Store instants in UTC, but evaluate task membership, habit schedules, and the dashboard’s date in the user’s IANA time zone.
- Dashboard is a capped, authorization-filtered projection, not the source of truth. Task completion feeds task/calendar views; check-ins feed habits and streaks; completed focus sessions feed focus analytics; goal progress stays owned by goals.
- Refresh or invalidate `GET /api/dashboard/today` after any successful source-feature write. Return stable IDs and ISO-8601 strings; do not expose unrelated private notes or persistence metadata in the aggregation.

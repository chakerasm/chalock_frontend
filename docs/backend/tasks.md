# Tasks API contract

## Scope and ownership

Tasks are the source of truth for personal work items. The Tasks frontend uses browser MSW mocks for the endpoints below; this document is the future backend contract only. The Today dashboard consumes a filtered task projection, so a successful task write must make the task aggregation stale or publish an equivalent invalidation event.

## Entity

```json
{
  "id": "task-1",
  "title": "Review project brief",
  "description": "Check scope, decision owners, and the first delivery date.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-09-26",
  "dueTime": "09:30",
  "estimatedMinutes": 45,
  "goalId": "goal-3",
  "createdAt": "2026-09-22T09:00:00.000Z",
  "updatedAt": "2026-09-25T16:30:00.000Z"
}
```

Required persisted fields are `id`, `title`, `status`, `priority`, `createdAt`, and `updatedAt`. `description`, `dueDate`, `dueTime`, `estimatedMinutes`, `goalId`, and `completedAt` are omitted when absent. `goalId` optionally associates one task with a Goal; validate its ownership whenever supplied. Clear it with `{"goalId": null}`. See [goals.md](goals.md) for relationship and derived-progress semantics.

Allowed statuses: `todo`, `in_progress`, `completed`, `cancelled`. Allowed priorities: `low`, `medium`, `high`.

Dates use `YYYY-MM-DD` local calendar dates. Times use 24-hour `HH:mm` local time. `createdAt`, `updatedAt`, and `completedAt` are UTC ISO-8601 instants. The current product permits a due time without a due date; it does not place that task in Today or Upcoming.

Today includes unfinished, non-cancelled tasks due on the user’s local date plus unfinished overdue tasks. Completed overdue tasks are not overdue. A task with no due date is shown in All, not Today or Upcoming.

## Endpoints

### `GET /api/tasks`

Lists tasks owned by the authenticated user.

Supported optional query parameters:

| Parameter  | Format         | Meaning                                    |
| ---------- | -------------- | ------------------------------------------ |
| `status`   | task status    | Exact status filter.                       |
| `priority` | task priority  | Exact priority filter.                     |
| `dueFrom`  | `YYYY-MM-DD`   | Includes tasks due on or after this date.  |
| `dueTo`    | `YYYY-MM-DD`   | Includes tasks due on or before this date. |
| `goalId`   | UUID/string ID | Exact associated goal.                     |
| `search`   | string         | Case-insensitive title/description search. |
| `cursor`   | opaque string  | Cursor from a previous response.           |
| `limit`    | integer 1–100  | Page size; default 50.                     |

Example response:

```json
{
  "data": [
    {
      "id": "task-1",
      "title": "Review project brief",
      "status": "todo",
      "priority": "high",
      "createdAt": "2026-09-22T09:00:00.000Z",
      "updatedAt": "2026-09-25T16:30:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Use cursor pagination, sorted by due date/time (undated tasks last) then stable ID. The local mock already returns this envelope with `nextCursor: null`; it applies the supported filters but does not paginate its seeded data.

### `GET /api/tasks/:taskId`

Returns one task if it belongs to the authenticated user. Return `404` with `TASK_NOT_FOUND` for missing or inaccessible IDs to avoid information disclosure.

### `POST /api/tasks`

Fast capture requires only a title:

```json
{ "title": "Prepare the project update" }
```

Full request:

```json
{
  "title": "Prepare the project update",
  "description": "Include launch risks.",
  "dueDate": "2026-09-27",
  "dueTime": "10:00",
  "priority": "medium",
  "estimatedMinutes": 30,
  "goalId": "goal-3"
}
```

The server sets `id`, `status: "todo"`, `createdAt`, and `updatedAt`; it ignores client-supplied lifecycle timestamps. Validate title after trimming (1–120 characters), description (1–2,000), date/time formats, priority, duration integer (1–1,440), and accessible goal ID. Return `201` and the created task.

### `PATCH /api/tasks/:taskId`

Accepts any non-empty subset of create fields plus `status`.

```json
{ "status": "completed" }
```

```json
{ "dueDate": "2026-09-29", "dueTime": "14:30", "priority": "high" }
```

The server sets `updatedAt` on every accepted write. Transitioning to `completed` sets `completedAt` at server time; changing to any other status clears it. `cancelled` tasks remain editable but are excluded from Today and Upcoming. Return the full updated task.

### `DELETE /api/tasks/:taskId`

Deletes an owned task and returns `204 No Content`. This may initially be a hard delete; if audit requirements arrive, implement a soft-delete marker without changing client behavior.

## Errors

All errors return `{ "code": "...", "message": "..." }`.

| Status | Code                  | Condition                                                                       |
| ------ | --------------------- | ------------------------------------------------------------------------------- |
| `400`  | `INVALID_DUE_DATE`    | Invalid date/time, an impossible date, or an unsupported date/time combination. |
| `401`  | `UNAUTHENTICATED`     | No valid session.                                                               |
| `403`  | `GOAL_ACCESS_DENIED`  | Supplied goal does not belong to the user/workspace.                            |
| `404`  | `TASK_NOT_FOUND`      | Missing or inaccessible task.                                                   |
| `409`  | `INVALID_TASK_STATUS` | Rejected lifecycle transition.                                                  |
| `422`  | `TASK_TITLE_REQUIRED` | Missing or blank title.                                                         |
| `422`  | `INVALID_TASK_STATUS` | Status is outside the allowed enum.                                             |

Use `5xx` for unexpected persistence failures. Validation failures should identify the invalid field where safe to do so.

## Feature relationships and persistence rules

- The Today dashboard reads the task projection but does not own task persistence. Invalidate `GET /api/dashboard/today` after task create, update, or delete.
- `goalId` is an optional relationship to one Goal. Goal status changes and archiving do not change task status or delete tasks. Task completion or association changes update task-based Goal progress for the old and new Goal.
- A focus session may reference a task title for the active session display. Focus duration remains owned by Focus, not Task.
- Evaluate Today and overdue membership in the user’s configured IANA time zone, not UTC midnight.

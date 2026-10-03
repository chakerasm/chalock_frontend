# Goals API contract

## Scope and ownership

Goals represent outcomes, not executable work items. Tasks remain independently owned and may optionally reference a Goal. Focus sessions and Pomodoro focus history may optionally reference a Goal. Archiving a Goal must not delete or mutate associated tasks or focus history. The frontend currently uses MSW for the endpoints below; this document specifies the future backend contract only.

## Goal entity

```json
{
  "id": "goal-1",
  "title": "Pass GH-300",
  "description": "Pass the GH-300 certification exam.",
  "status": "active",
  "targetDate": "2026-10-15",
  "progressStrategy": { "mode": "task-based" },
  "progress": 72,
  "createdAt": "2026-08-20T09:00:00.000Z",
  "updatedAt": "2026-09-25T16:30:00.000Z"
}
```

Required fields are `id`, `title`, `status`, `progressStrategy`, `progress`, `createdAt`, and `updatedAt`. `description`, `targetDate`, and `completedAt` are omitted when absent. Titles are trimmed and limited to 120 characters; descriptions are limited to 2,000 characters. `targetDate` is an ISO local calendar date (`YYYY-MM-DD`). `createdAt`, `updatedAt`, and `completedAt` are UTC ISO-8601 instants.

Allowed statuses are `active`, `paused`, `completed`, and `archived`. `completedAt` is server-set when status intentionally changes to `completed` and cleared when status changes away from `completed`. Progress reaching 100 does not change status or set `completedAt`; completion is always an explicit status update.

## Progress strategy

The strategy is a discriminated value intended to allow future strategies without changing Goal identity or task relationships:

```json
{ "mode": "manual" }
```

```json
{ "mode": "task-based" }
```

For `manual`, `progress` is an integer from 0 through 100 supplied by the user and stored on the Goal.

For `task-based`, progress is the percentage of linked tasks whose status is `completed`:

```text
total = number of tasks whose goalId equals this Goal ID
completed = number of those tasks with status "completed"
progress = total == 0 ? 0 : round(completed / total * 100)
```

Cancelled and in-progress tasks remain in the denominator because they are still linked work; only `completed` tasks are in the numerator. With zero linked tasks, progress is exactly 0%, and the UI should state that there are no linked tasks. Task-based progress must not be client-writable.

### Calculation ownership

The backend should be authoritative for task-based progress. It has the canonical task associations and statuses, can calculate a consistent Goal read model, and can update progress in the same transaction as task association or status changes. Return derived `progress` from `GET /api/goals`, `GET /api/goals/:goalId`, and successful Goal writes. A response may include an optional summary such as `completedTaskCount` and `totalTaskCount`; clients should not persist a competing derived value. The frontend may calculate a display preview from its current task query, but should converge to the server value after refetch. Manual progress is persisted as supplied after 0–100 validation.

## Task relationship

Tasks have an optional `goalId`. A task belongs to at most one Goal; a Goal may have zero or many Tasks. Assigning a task uses the task write contract, for example `PATCH /api/tasks/:taskId` with `{ "goalId": "goal-1" }`. Clear the relationship with `{"goalId": null}`. Validate that the Goal is accessible to the authenticated user/workspace. The task remains valid if the Goal is paused, completed, or archived; changing Goal status never cascades to task status. Changing a task's `goalId` or completion status updates derived progress for its previous and new Goal.

`POST /api/goals/:goalId/tasks/bulk` creates 1–500 validated Tasks for this Goal atomically. It assigns `status: "todo"`, uses one request, preserves submitted order where supported, and rolls back all rows on any unexpected persistence failure. See [tasks.md](tasks.md#post-apigoalsgoalidtasksbulk) for its payload, response, duplicate semantics, and structured row-error contract.

## Focus relationship

Focus timer sessions, completed focus sessions, and Pomodoro focus history may carry an optional `goalId`. This is an association only and does not cascade when a Goal changes status or is archived. Accumulated focus time is the sum of completed session durations for that Goal, counting completed timer sessions and completed focus-phase Pomodoro history once each. Exclude skipped/cancelled focus phases and active or paused work from the completed-time total. The frontend currently reads this optional relationship from local Focus history; a future Focus API should expose the same stable `goalId` and duration semantics.

## Endpoints

All endpoints operate within the authenticated user's scope. Errors use `{ "code": "...", "message": "..." }`.

### `GET /api/goals`

Lists Goals. Optional `status=active|paused|completed|archived` filters by exact status. Return newest-updated first, with a stable ID tie-breaker. Task-based `progress` is calculated authoritatively on this response.

### `GET /api/goals/:goalId`

Returns one owned Goal and its current derived progress. Return `404 GOAL_NOT_FOUND` for absent or inaccessible IDs.

### `POST /api/goals`

Creates an active Goal. The server assigns `id`, timestamps, and status. Request:

```json
{
  "title": "Read 12 books",
  "description": "Finish twelve books before year end.",
  "targetDate": "2026-12-31",
  "progressStrategy": { "mode": "manual" },
  "progress": 0
}
```

For task-based Goals, the server derives progress (initially 0%) and ignores/rejects client attempts to set a non-derived value. Return `201 Created` and the full Goal.

### `PATCH /api/goals/:goalId`

Accepts a non-empty subset of `title`, `description`, `targetDate`, `progressStrategy`, `progress`, and `status`. Validate the merged Goal. Only manual progress can be directly updated. Changing to task-based immediately derives progress from linked tasks. Set `updatedAt` on accepted writes. Setting status to `completed` is the explicit completion action; no progress threshold triggers it implicitly.

### `DELETE /api/goals/:goalId/archive`

Soft-archives the Goal by setting status to `archived` and updating `updatedAt`. This is idempotent, returns the archived Goal, and retains Goal/task/focus history. This endpoint is the documented interpretation of the API shorthand `DELETE/archive /api/goals/:goalId`; it is not a hard delete.

## Errors

| Status | Code                    | Condition                                                   |
| ------ | ----------------------- | ----------------------------------------------------------- |
| `400`  | `INVALID_TARGET_DATE`   | Invalid or impossible local calendar date.                  |
| `401`  | `UNAUTHENTICATED`       | No valid session.                                           |
| `403`  | `GOAL_ACCESS_DENIED`    | A linked task or Goal is outside the user's scope.          |
| `404`  | `GOAL_NOT_FOUND`        | Missing or inaccessible Goal.                               |
| `422`  | `INVALID_GOAL`          | Invalid title, status, strategy, or manual progress.        |
| `422`  | `DERIVED_GOAL_PROGRESS` | Attempt to directly write progress for task-based strategy. |

Use `5xx` for unexpected persistence failures. A deleted Goal is not exposed as an empty successful response.

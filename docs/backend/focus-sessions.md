# Focus Sessions API contract

## Scope and current frontend behavior

Focus owns recorded stopwatch, countdown timer, pomodoro, and manual focus sessions. The current Focus workspace persists one in-progress stopwatch/countdown or Pomodoro cycle and up to 50 saved/history records locally in the browser. It reconstructs time from persisted elapsed durations plus timestamps; it never treats an interval tick as the source of truth. This document defines the future authenticated API only; no backend is implemented.

The Today dashboard consumes a small active-session projection and focus summary. When a backend is introduced, task writes, focus writes, and dashboard reads should invalidate or refresh that projection.

## FocusSession entity

```json
{
  "id": "focus-1",
  "type": "timer",
  "status": "active",
  "startedAt": "2026-09-26T09:00:00.000Z",
  "durationSeconds": 480,
  "plannedDurationSeconds": 1500,
  "taskId": "task-4",
  "goalId": "goal-2"
}
```

| Field | Required | Rules |
| --- | --- | --- |
| `id` | yes | Stable opaque identifier. |
| `type` | yes | `stopwatch`, `timer`, `pomodoro`, or `manual`. |
| `status` | yes | `active`, `paused`, `completed`, or `cancelled`. |
| `startedAt` | when a session has started | UTC ISO-8601 instant. Manual historical imports may omit it. |
| `endedAt` | completed/cancelled | UTC ISO-8601 instant; otherwise omitted. |
| `durationSeconds` | yes | Server-authoritative accrued duration, integer >= 0. |
| `plannedDurationSeconds` | timer/pomodoro | Positive integer. Omitted for stopwatch and manual sessions. |
| `taskId` | no | Optional owned task association. |
| `goalId` | no | Optional owned goal association. |

Only one stopwatch/countdown session or Pomodoro cycle may be `active` or `paused` per user at a time. `completed` and `cancelled` sessions are immutable except for safe metadata corrections authorized by the product.

## API

### `GET /api/focus-sessions`

Lists the authenticated user’s recorded sessions. Support optional `status`, `type`, `taskId`, `goalId`, `from`, `to`, `cursor`, and `limit` filters. Use cursor pagination, newest `endedAt`/`startedAt` first.

```json
{
  "data": [{ "id": "focus-1", "type": "timer", "status": "completed", "startedAt": "2026-09-26T09:00:00.000Z", "endedAt": "2026-09-26T09:25:00.000Z", "durationSeconds": 1500, "plannedDurationSeconds": 1500 }],
  "nextCursor": null
}
```

### `GET /api/focus-sessions/active`

Returns the one `active` or `paused` session, or `null`. The response duration is computed at response time, so an inactive browser tab or refresh cannot make it stale.

### `POST /api/focus-sessions`

Starts a session. A stopwatch needs only its type:

```json
{ "type": "stopwatch", "taskId": "task-4" }
```

A countdown timer needs a planned duration:

```json
{
  "type": "timer",
  "plannedDurationSeconds": 1500,
  "goalId": "goal-2"
}
```

The server sets `id`, `status: "active"`, `startedAt`, and `durationSeconds: 0`. Return `201` and the created entity. Return `409 ACTIVE_FOCUS_SESSION` if another session is active or paused.

### `PATCH /api/focus-sessions/:sessionId`

State transitions use an explicit action; clients may include a non-authoritative `observedDurationSeconds` for diagnostics, but it must never be persisted as fact.

```json
{ "action": "pause" }
```

```json
{ "action": "resume" }
```

```json
{ "action": "complete" }
```

```json
{ "action": "cancel" }
```

Valid transitions are `active -> paused|completed|cancelled`, `paused -> active|completed|cancelled`, and no lifecycle transitions from terminal statuses. `pause` retains accrued duration; `resume` starts a new server-timed active segment; `complete` sets `endedAt`; `cancel` sets `endedAt` and excludes the session from completed-time summaries. Return the full updated entity.

For a timer, the backend should complete at its planned deadline even if the client is offline. A client may render completion locally from timestamps first, then reconcile with this endpoint.

## Pomodoro cycles

Pomodoro is a stateful cycle, not four unrelated timers. The current frontend uses the default configuration below and keeps it in its validated local snapshot; configuration is intentionally not yet editable.

| Setting | Default |
| --- | --- |
| Focus duration | 25 minutes / 1,500 seconds |
| Short break duration | 5 minutes / 300 seconds |
| Long break duration | 15 minutes / 900 seconds |
| Completed focus phases before long break | 4 |

```json
{
  "id": "pomodoro-1",
  "status": "active",
  "phase": "focus",
  "phaseStartedAt": "2026-09-26T09:00:00.000Z",
  "phaseElapsedSeconds": 378,
  "completedFocusSessions": 1,
  "focusSessionsUntilLongBreak": 4,
  "focusDurationSeconds": 1500,
  "shortBreakDurationSeconds": 300,
  "longBreakDurationSeconds": 900,
  "taskId": "task-4",
  "goalId": "goal-2",
  "intention": "Study chapter 4"
}
```

`phase` is `focus`, `short_break`, or `long_break`; `status` is `active` or `paused`. `phaseElapsedSeconds` is accrued time from finished active segments and `phaseStartedAt` begins the current active segment. The server derives the live phase duration from those values and its own clock.

`completedFocusSessions` counts only fully completed focus phases in the current four-session cycle. A completed focus phase advances to a short break until the count reaches four; the fourth advances to a long break. Completing or skipping a break advances to focus. Skipping a focus phase moves to a short break but does not increment the count, so the next focus phase retains the same session number. Cancelling ends the cycle.

### Pomodoro endpoints

`POST /api/pomodoro-cycles` starts a cycle. All associations and the intention are optional:

```json
{ "taskId": "task-4", "intention": "Study chapter 4" }
```

The server applies current product defaults, sets the initial phase to `focus`, and returns `201`. Return `409 ACTIVE_FOCUS_SESSION` if a stopwatch, timer, or another cycle is active or paused.

`GET /api/pomodoro-cycles/active` returns the active/paused cycle or `null`, with a server-derived phase elapsed/remaining value. It is the recovery source after refresh, route changes, and a switch to another device.

`PATCH /api/pomodoro-cycles/:cycleId` accepts explicit actions:

```json
{ "action": "pause" }
```

```json
{ "action": "resume" }
```

```json
{ "action": "skip_phase" }
```

```json
{ "action": "cancel" }
```

Phase completion is time-driven by the server, not a trusted client `complete` action. A delayed client can request a transition, but the server calculates whether the deadline was reached and applies the correct single transition. Pause/resume preserves accrued phase time; a skipped or cancelled focus phase never increments `completedFocusSessions`.

### Pomodoro phase history

Record a compact `PomodoroPhaseRecord` for each focus phase that ends. Its completion state is `completed`, `skipped`, or `cancelled`. Only a completed focus phase creates completed focus time in the dashboard summary and a completed `FocusSession` of type `pomodoro`; skipped and cancelled records remain visible in the compact history without increasing focus totals. Break phases are not focus-history records by default.

```json
{
  "id": "pomodoro-phase-1",
  "cycleId": "pomodoro-1",
  "completionState": "completed",
  "durationSeconds": 1500,
  "endedAt": "2026-09-26T09:25:00.000Z",
  "taskId": "task-4",
  "goalId": "goal-2",
  "intention": "Study chapter 4"
}
```

## Server-authoritative duration validation

Do not trust `durationSeconds` from the client. Persist the accrued duration at each pause plus an `activeSince` UTC instant (or immutable session segments). At every read or write, calculate:

```text
authoritativeDuration = accruedDuration + max(0, floor(serverNow - activeSince))
```

When pausing, completing, or cancelling, store that server-derived value and clear `activeSince`. When resuming, set `activeSince` to server time. Clamp timer completion to `plannedDurationSeconds` and reject impossible client state changes rather than allowing a device clock or stale page to inflate duration. The server’s clock and transaction/row lock determine the single active session.

## Validation and errors

- `type` must be one of the supported enum values.
- `plannedDurationSeconds` is required for `timer` and `pomodoro`, forbidden for `stopwatch` and `manual`, and must be an integer from 1 to 86,400.
- A Pomodoro cycle accepts only the supported phase/action enums; its configured phase durations and focus-session threshold are server controlled. `intention` is optional, trimmed, and 1–120 characters when supplied.
- `taskId` and `goalId`, when supplied, must belong to the current user/workspace; associations are optional and never required to save a session.
- `startedAt`, `endedAt`, and durations are server-controlled for normal lifecycle writes. Manual imports require a privileged/manual-create workflow with stricter date validation.
- Terminal sessions cannot resume or be completed twice.

All errors use `{ "code": "...", "message": "..." }`.

| Status | Code | Condition |
| --- | --- | --- |
| `400` | `INVALID_FOCUS_SESSION_TYPE` | Unsupported type. |
| `400` | `INVALID_PLANNED_DURATION` | Missing, invalid, or incompatible planned duration. |
| `401` | `UNAUTHENTICATED` | No valid session. |
| `403` | `TASK_ACCESS_DENIED` / `GOAL_ACCESS_DENIED` | Association is outside the user/workspace. |
| `404` | `FOCUS_SESSION_NOT_FOUND` | Missing or inaccessible session. |
| `409` | `ACTIVE_FOCUS_SESSION` | A different active or paused session already exists. |
| `409` | `INVALID_FOCUS_TRANSITION` | Action is not allowed from the current status. |
| `422` | `INVALID_FOCUS_SESSION_PAYLOAD` | Malformed lifecycle request. |
| `409` | `INVALID_POMODORO_TRANSITION` | Stale or impossible phase action. |
| `422` | `INVALID_POMODORO_PAYLOAD` | Invalid association, intention, phase, or action. |

## Relationships

- Tasks and Goals own their own persistence. Deleting or completing either one must not delete focus history; preserve the optional ID or surface an archived label under that feature’s policy.
- The Today dashboard’s focus summary includes completed sessions only. Its active-session projection comes from `GET /api/focus-sessions/active` and must use the same user time-zone/session authorization context.
- Browser notification permission belongs to the client. The API never requests it and should not assume a client displayed a completion alert.

## Future multi-device synchronization

The backend is the eventual source of truth for active cycles. Persist a monotonically increasing `version` or `updatedAt` with each active cycle, return it from reads, and require it for mutations through an `If-Match` value or request field. The server must lock the user’s active-session row when applying a deadline, skip, pause, resume, or cancellation so two devices cannot both advance a phase or count the same focus block twice.

Clients should re-fetch the active cycle on app focus, reconnect, or a mutation conflict, then replace their locally derived state with the server snapshot. Server-sent events, WebSocket messages, or short polling may publish version changes later; timestamp rendering remains client-side, but phase transitions reconcile to the server result. Use idempotency keys for lifecycle mutations so an offline retry cannot duplicate a history record.

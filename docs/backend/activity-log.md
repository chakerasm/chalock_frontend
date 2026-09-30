# Activity log

## Purpose

The activity timeline is a compact, user-facing history of meaningful progress. It is not a technical audit log. It should include only milestones such as completed tasks, focus sessions, habits, goals, planner blocks, created notes, subscription changes, and recorded expenses.

## Endpoint

`GET /api/activity`

Optional query parameters:

- `from`: ISO-8601 timestamp, inclusive.
- `to`: ISO-8601 timestamp, inclusive.
- `types`: comma-separated activity types, such as `task_completed,expense_recorded`.
- `cursor`: opaque cursor returned by the previous response.
- `limit`: optional bounded page size; the server should apply a safe default and maximum.

Example response:

```json
{
  "items": [
    {
      "id": "activity_123",
      "type": "task_completed",
      "entityType": "task",
      "entityId": "task_123",
      "title": "Implement reminder page",
      "occurredAt": "2026-09-30T09:42:00+01:00",
      "href": "/tasks"
    }
  ],
  "nextCursor": "opaque-cursor-or-null"
}
```

## Activity model

```ts
type Activity = {
  id: string
  type:
    | 'task_completed'
    | 'focus_session_completed'
    | 'habit_completed'
    | 'goal_completed'
    | 'note_created'
    | 'subscription_added'
    | 'subscription_cancelled'
    | 'expense_recorded'
    | 'planner_block_completed'
  entityType: string
  entityId: string
  title: string
  description?: string
  occurredAt: string
  href?: string
}
```

`occurredAt` is an absolute ISO-8601 instant. The client groups it in the user's active timezone and labels groups as Today, Yesterday, or a calendar date.

## Filtering, permissions, and ordering

- Return only events belonging to the authenticated user and to entities the user may access.
- Order descending by `occurredAt`, with a stable `id` tie-breaker for cursor pagination.
- Ignore technical edits, page visits, searches, and low-value state changes.
- Deleted or inaccessible source entities should either omit their event or return a safe, non-navigable historical item according to product retention policy.

## Long-term strategy

For the frontend-first MVP, the Activity screen derives milestones from the existing feature records. This is intentionally best-effort: historical availability depends on each domain's retained records.

For reliable cross-device history and cursor pagination, persist a small, normalized activity event at the domain command boundary (for example, when a task completion succeeds). Store only the user-facing event payload and source reference; do not expose raw audit events. Derived-on-read can remain useful for backfilling, but a persisted projection is the recommended long-term API strategy because it preserves the time of the meaningful action even if the source record changes later.

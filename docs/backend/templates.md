# Templates API contract

Templates are private, user-owned reusable blueprints. Updating or deleting one never changes entities created from it.

## Entity and validation

```ts
type TemplateType = 'task' | 'task_list' | 'planner_day' | 'note' | 'routine'
type Template = { id: string; name: string; description?: string; type: TemplateType; payload: TemplatePayload; isFavorite: boolean; usageCount?: number; lastUsedAt?: string; createdAt: string; updatedAt: string }
```

Payloads are discriminated by `type`: a reusable task; an ordered list of 1-50 tasks; a planner day containing 1-50 local `HH:mm` blocks; a note with optional title/content; or a Habit creation payload for a routine. Names are required and <=120 chars, descriptions <=500 chars, content/domain field limits match their owning resources, and planner `endTime` must be later than `startTime`. Only `{{date}}`, `{{today}}`, and `{{weekday}}` note variables are valid.

## Endpoints

All endpoints are beneath `/api/v1` and require bearer authentication.

- `GET /templates?type=&favorite=&search=` lists owned templates.
- `GET /templates/:templateId` returns one template.
- `POST /templates` creates one.
- `PATCH /templates/:templateId` changes metadata, favorite state, or payload; type is immutable.
- `DELETE /templates/:templateId` returns `204` and never deletes applied entities.
- `POST /templates/:templateId/duplicate` creates an independent `{name} Copy`.

Errors use the common envelope: `TEMPLATE_NOT_FOUND`, `INVALID_TEMPLATE_TYPE`, `INVALID_TEMPLATE_PAYLOAD`, and `INVALID_TEMPLATE_VARIABLE`.

## Applying templates and atomicity

The frontend MVP previews then calls existing APIs: task/list -> `POST /tasks`; planner -> `POST /time-blocks` with `targetDate`; note -> `POST /notes`; routine -> `POST /habits`. Planner conflict detection is advisory, never overwrites/moves an existing block. Because multi-entity frontend fan-out may partially fail, the preferred backend evolution is `POST /templates/:templateId/apply` with `{ targetDate?, selectedItemIds? }`, which should create all results transactionally or none, increment usage metadata, and return `TEMPLATE_CONFLICT`, `INVALID_TARGET_DATE`, or `TEMPLATE_APPLICATION_FAILED`.

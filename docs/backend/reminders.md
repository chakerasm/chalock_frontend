# Reminders API contract

## Model and time semantics

`Reminder` is a reusable definition with an optional local-time `triggerAt` ISO timestamp, optional recurrence, optional entity link, and optional positive `advanceOffset` (`minute`, `hour`, `day`, `week`). Entity links use `task`, `subscription`, `habit`, `goal`, `time_block`, or `custom` plus an owned `entityId`.

Absolute reminders use a timezone-aware ISO instant. Recurring reminders retain the local wall-clock time (for example, daily 08:00 stays 08:00 through DST or a timezone change); store the user IANA timezone with the definition. Relative reminders remain attached to their source event: a subscription renewal moved from Oct 15 to Oct 20 changes a three-day-before trigger from Oct 12 to Oct 17.

`ReminderRecurrence` supports `daily`, `weekly`, `monthly`, and `yearly`, `interval`, optional Sunday-zero `daysOfWeek`, `dayOfMonth`, `month`, and `endDate`. Monthly day 31 uses the last valid day of shorter months.

Statuses are `scheduled`, `triggered`, `completed`, `dismissed`, and `cancelled`. Snoozing affects only the active occurrence; it never changes the recurrence definition. Future server persistence should model `ReminderOccurrence` separately (`scheduledFor`, `triggeredAt`, `completedAt`, status) so recurring history and snoozes are reliable.

## API

Use `GET /api/reminders?status=&from=&to=&entityType=&entityId=&recurring=`, `GET /api/reminders/:id`, `POST /api/reminders`, `PATCH /api/reminders/:id`, and `DELETE /api/reminders/:id`. Explicit action endpoints are appropriate for occurrence-specific operations: `POST /api/reminders/:id/snooze` and `POST /api/reminders/:id/complete`.

Validate title, trigger/recurrence, positive offset, weekday range, recurrence end date, accessible entity, and a source reference date for relative reminders. Return `REMINDER_NOT_FOUND`, `INVALID_TRIGGER_TIME`, `INVALID_RECURRENCE`, `INVALID_REMINDER_OFFSET`, `ENTITY_NOT_FOUND`, `ENTITY_HAS_NO_REFERENCE_DATE`, or `INVALID_STATUS_TRANSITION` as `{ "code": "...", "message": "..." }`.

The frontend MVP can notify only while a tab is active and permission is granted; it cannot guarantee delivery while closed, suspended, offline, or blocked by the OS. The backend must later schedule occurrences and deliver push/email/mobile notifications reliably. Never request browser permission on page load.

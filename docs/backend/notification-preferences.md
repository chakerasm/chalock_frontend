# Notification preferences API contract

`NotificationPreferences` controls a user's delivery choices. It does not create, cancel, or reschedule reminders; those remain resources of the Reminders domain.

```ts
type NotificationPreferences = {
  inAppEnabled: boolean
  browserEnabled: boolean
  soundsEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string // local HH:mm
    end: string // local HH:mm
  }
  categories: {
    tasks: boolean
    habits: boolean
    planner: boolean
    reminders: boolean
    subscriptions: boolean
    finance: boolean
    goals: boolean
  }
}
```

## Endpoints

- `GET /api/me/notification-preferences` returns the user's preferences.
- `PATCH /api/me/notification-preferences` accepts a partial preferences update and returns the saved resource.

Defaults are in-app enabled, browser and sounds disabled, all categories enabled, and quiet hours disabled with `22:00` to `07:00` retained as editable defaults.

## Evaluation order

For a notification in a category to be delivered, the global channel must be enabled, that category must be enabled, and the current local time must be outside quiet hours. Quiet hours are inclusive at `start` and exclusive at `end`. A range whose start is later than its end crosses midnight: `22:00` to `07:00` suppresses delivery from 22:00 through 06:59.

Quiet hours use the user's configured IANA timezone at delivery time. The backend must use the current timezone preference rather than a device offset stored when the preference was saved, so DST changes preserve local wall-clock times.

## Browser and future channels

`browserEnabled` is an application preference, not a browser permission grant. The browser permission is requested only by an explicit frontend user action and may be `granted`, `denied`, or not yet requested. A denied permission is changed in browser settings; it is not a backend validation error.

Email, push, and other channels are future delivery channels. They should follow the same global/category/quiet-hours precedence and require their own verified channel capability. Server scheduling and reliable delivery remain future backend work.

Suggested validation errors: `INVALID_NOTIFICATION_PREFERENCES`, `INVALID_QUIET_HOURS`, and `NOTIFICATION_PREFERENCES_NOT_FOUND`.

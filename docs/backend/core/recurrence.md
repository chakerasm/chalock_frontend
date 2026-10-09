# Shared recurrence contract

Planner blocks and Task series use one local-calendar rule: `daily`, `weekly`, `monthly`, or `yearly`; interval; selected weekdays; month-day clamping; monthly ordinal weekdays (including last); and never, date, or count end conditions. Store local `YYYY-MM-DD` dates, Sunday-zero weekdays, and an IANA timezone. Generate with timezone-aware calendar operations, not UTC or fixed 24-hour arithmetic.

Consumers return flattened, deduplicated occurrences with per-occurrence exceptions. Scope vocabulary is shared: `this`, `future`, and `series`. Completion is occurrence-specific and preserves `completedAt`.

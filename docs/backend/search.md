# Global search API contract

## Endpoint

`GET /api/search?q=spotify&types=task,note,subscription`

`q` is required and must contain 2–100 non-whitespace characters. `types` is optional and accepts a comma-separated subset of `task`, `note`, `goal`, `habit`, `planner`, `reminder`, `subscription`, and `transaction`.

```json
{
  "results": [
    {
      "id": "sub_123",
      "type": "subscription",
      "title": "Spotify Premium",
      "subtitle": "Renews Oct 12",
      "metadata": "99 MAD",
      "href": "/subscriptions"
    }
  ],
  "nextCursor": null
}
```

## Rules

- Search only resources the authenticated user can access; never leak titles or match counts from another user/workspace.
- Normalize case, repeated whitespace, accents, and punctuation consistently. Ranking should prefer exact title matches, then title prefixes, then other text matches.
- Limit the initial response to 50 results, with a maximum of 10 per entity type. Support cursor pagination only when additional results are requested.
- Search indexed title/name, user-authored descriptions/content, and practical metadata such as subscription renewal dates and transaction amounts. Do not index secrets or sensitive credentials.
- Return `401` for expired sessions, `400 INVALID_SEARCH_QUERY` for invalid parameters, and use the application’s standard error contract.

The current frontend implementation searches locally cached feature data. When this endpoint exists, debounce requests (about 150–250ms), retain prior results during refresh, and keep this result contract unchanged.

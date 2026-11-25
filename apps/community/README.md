# BMC NY Community

From this directory, install dependencies and start the development server:

```sh
npm ci
npm run dev -- --port 3001
```

Open [localhost:3001](http://localhost:3001). The homepage is in `src/app/page.tsx`. Keep static assets in `public/` and project configuration and local `.env.*` files at the community app root.

## Project structure

We follow Next.js's [split by feature or route example](https://nextjs.org/docs/app/getting-started/project-structure#split-project-files-by-feature-or-route). Keep code specific to a route beside that route. Put components used across unrelated routes in `src/app/components/` and shared infrastructure in `src/app/lib/`. The `@/*` alias points to `src/`.

For example, when the app adds events and shared UI, the tree could look like this:

```text
src/app/
├── layout.tsx
├── page.tsx
├── globals.css
├── favicon.ico
├── components/
│   ├── site-header.tsx
│   └── ui/
│       └── button.tsx
├── lib/
│   └── supabase/
│       └── server.ts
└── events/
    ├── page.tsx
    ├── [eventId]/
    │   └── page.tsx
    └── components/
        └── event-card.tsx
```

Add directories as their first files are needed. Use `components/` to group route-specific UI, or keep a single component directly beside `page.tsx`.

# BMC NY Community

Start the app from this directory with `npm run dev -- --port 3001` and open [localhost:3001](http://localhost:3001).

## Routes

- `/` Home
- `/services` Services
- `/events` Events
- `/profile` Profile
- `/schedule` My Schedule

Each screen lives in its route's `page.tsx` under `src/app/`. Keep components used by a single route in that route's `components/` folder. The shared shell, browser state provider, and components used by multiple routes live in `src/app/components/`. Bulletin and scheduling logic lives in `src/app/model/`.

## Verification

Run `npm run lint`, `node --test tests/scheduling.test.cjs`, and `npm run build` from this directory.

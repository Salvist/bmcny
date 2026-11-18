const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

// Exercise server helpers and rendered cards without live services or credentials.
function loadModule(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const module = { exports: {} };
  const run = vm.runInThisContext(
    `(function(require, module, exports) { ${source}\n})`,
    { filename },
  );
  run((id) => {
    if (id in mocks) return mocks[id];
    let local;
    if (id.startsWith("@/")) local = path.resolve(__dirname, "..", "src", id.slice(2));
    else if (id.startsWith(".")) local = path.resolve(path.dirname(filename), id);
    if (local) {
      const target = [local, `${local}.ts`, `${local}.tsx`].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(target, `Cannot resolve ${id} from ${relativePath}`);
      return loadModule(target, mocks);
    }
    return require(id);
  }, module, module.exports);
  return module.exports;
}

const helpers = loadModule("src/lib/admin-dashboard.ts");
const NOW = new Date("2026-11-07T17:00:00.000Z");
const event = (id, overrides = {}) => ({
  id, name: `Event ${id}`, image_url: `/event-${id}.jpg`, is_published: true,
  display_start_date: "2026-11-01", display_end_date: "2026-11-30",
  ...overrides,
});
const prayer = (id, overrides = {}) => ({
  id, name: "Visitor", text: "Please pray for our family.",
  created_at: "2026-11-07T16:00:00.000Z", ...overrides,
});

// This small query fake evaluates filters, ordering, selection and limits against
// fixtures, so a changed boundary or order affects the returned dashboard data.
function fakeClient(tables = {}, outcomes = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const call = { table, filters: [], orders: [], limit: undefined };
      const index = calls.push(call) - 1;
      const query = {
        select(fields, options) { call.fields = fields; call.options = options; return this; },
        order(field, options) { call.orders.push([field, options]); return this; },
        limit(value) { call.limit = value; return this; },
        then(resolve, reject) {
          if (outcomes[index] instanceof Error) return Promise.reject(outcomes[index]).then(resolve, reject);
          if (outcomes[index]) return Promise.resolve(outcomes[index]).then(resolve, reject);
          let rows = [...(tables[table] ?? [])].filter((row) => call.filters.every(([operator, field, value]) => {
            if (operator === "eq") return row[field] === value;
            if (operator === "gt") return row[field] > value;
            if (operator === "gte") return row[field] >= value;
            if (operator === "lt") return row[field] < value;
            if (operator === "lte") return row[field] <= value;
            throw new Error(`Unsupported filter ${operator}`);
          }));
          const count = rows.length;
          rows.sort((a, b) => {
            for (const [field, { ascending }] of call.orders) {
              if (a[field] === b[field]) continue;
              return (a[field] < b[field] ? -1 : 1) * (ascending ? 1 : -1);
            }
            return 0;
          });
          if (call.limit !== undefined) rows = rows.slice(0, call.limit);
          const fields = call.fields.split(",").map((field) => field.trim());
          const data = call.options?.head ? null : rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field]])));
          return Promise.resolve({ data, count: call.options?.count ? count : null, error: null }).then(resolve, reject);
        },
      };
      for (const operator of ["eq", "gt", "gte", "lt", "lte"]) {
        query[operator] = (field, value) => { call.filters.push([operator, field, value]); return query; };
      }
      return query;
    },
  };
}

test("New York dates respect local midnight in standard and daylight time", () => {
  for (const [instant, expected] of [
    ["2026-11-07T04:59:59Z", "2026-11-06"],
    ["2026-11-07T05:00:00Z", "2026-11-07"],
    ["2026-07-01T03:59:59Z", "2026-06-30"],
    ["2026-07-01T04:00:00Z", "2026-07-01"],
  ]) assert.equal(helpers.getNewYorkDate(new Date(instant)), expected);
  assert.equal(helpers.formatAdminDate("2026-11-07"), "Nov 7, 2026");
  assert.equal(helpers.formatPrayerDate("2026-11-07T17:00:00Z"), "Nov 7, 2026, 12:00 PM");
  assert.equal(helpers.formatPrayerDate("2026-07-01T17:00:00Z"), "Jul 1, 2026, 1:00 PM");
});

test("visibility uses inclusive display dates and drafts override display windows", () => {
  assert.equal(helpers.getEventVisibility(event("a", { display_start_date: "2026-11-07", display_end_date: "2026-11-07" }), "2026-11-07"), "Visible");
  assert.equal(helpers.getEventVisibility(event("a", { display_start_date: "2026-11-08" }), "2026-11-07"), "Scheduled");
  assert.equal(helpers.getEventVisibility(event("a", { display_end_date: "2026-11-06" }), "2026-11-07"), "Expired");
  for (const dates of [
    { display_start_date: "2026-11-08" },
    { display_end_date: "2026-11-06" },
    {},
  ]) assert.equal(helpers.getEventVisibility(event("a", { ...dates, is_published: false }), "2026-11-07"), "Draft");
});

test("the prayer cutoff is exactly 168 hours across both daylight saving transitions", () => {
  for (const [instant, expected] of [
    ["2026-03-09T12:00:00.000Z", "2026-03-02T12:00:00.000Z"],
    ["2026-11-02T12:00:00.000Z", "2026-10-26T12:00:00.000Z"],
  ]) {
    const now = new Date(instant);
    const cutoff = helpers.getRecentPrayerCutoff(now);
    assert.equal(cutoff, expected);
    assert.equal(now.getTime() - Date.parse(cutoff), 168 * 60 * 60 * 1000);
  }
});

test("event overview counts display statuses and previews visible rows before scheduled rows", async () => {
  const client = fakeClient({ events: [
    event("z", { display_end_date: "2026-11-08" }),
    event("a", { display_end_date: "2026-11-08" }),
    event("later", { display_end_date: "2026-12-01" }),
    event("future", { display_start_date: "2026-11-10" }),
    event("draft-past", { is_published: false, display_end_date: "2026-11-06" }),
    event("draft-future", { is_published: false, display_start_date: "2026-11-10" }),
    event("expired", { display_end_date: "2026-11-06" }),
  ] });
  const result = await helpers.loadEventOverview(client, NOW);
  assert.deepEqual(result.counts, { Visible: 3, Scheduled: 1, Draft: 2, Expired: 1 });
  assert.deepEqual(result.events.map(({ id }) => id), ["a", "z", "later"]);
  assert.equal(result.today, "2026-11-07");
  assert.equal(result.previewError, false);
  assert.ok(client.calls.slice(0, 4).every(({ options }) => options.head && options.count === "exact"));
  assert.ok(client.calls.slice(4).every(({ limit }) => limit === 3));
  assert.deepEqual(client.calls[4].orders, [["display_end_date", { ascending: true }], ["id", { ascending: true }]]);
  assert.deepEqual(client.calls[5].orders, [["display_start_date", { ascending: true }], ["id", { ascending: true }]]);
});

test("event previews fill remaining slots with earliest scheduled announcements", async () => {
  const client = fakeClient({ events: [
    event("visible"),
    event("future-z", { display_start_date: "2026-11-08" }),
    event("future-a", { display_start_date: "2026-11-08" }),
    event("future-later", { display_start_date: "2026-11-09" }),
  ] });
  const { events } = await helpers.loadEventOverview(client, NOW);
  assert.deepEqual(events.map(({ id }) => id), ["visible", "future-a", "future-z"]);
});

test("event count failures remain unavailable while independent counts and previews survive", async () => {
  const client = fakeClient({ events: [event("visible")] }, {
    0: { count: 0, data: null, error: { message: "private query details" } },
    2: new Error("private connection details"),
  });
  const overview = await helpers.loadEventOverview(client, NOW);
  assert.deepEqual(overview.counts, { Visible: null, Scheduled: 0, Draft: null, Expired: 0 });
  assert.equal(overview.previewError, false);
  assert.equal(overview.events.length, 1);
});

test("an event preview failure does not show misleading partial ordering or erase counts", async () => {
  for (const failure of [new Error("private connection details"), { data: null, count: null, error: { message: "private query details" } }]) {
    const overview = await helpers.loadEventOverview(fakeClient({ events: [event("visible")] }, { 5: failure }), NOW);
    assert.deepEqual(overview.counts, { Visible: 1, Scheduled: 0, Draft: 0, Expired: 0 });
    assert.equal(overview.previewError, true);
    assert.deepEqual(overview.events, []);
  }
});

test("prayer overview uses exact inclusive rolling boundaries, stable ordering and three previews", async () => {
  const cutoff = helpers.getRecentPrayerCutoff(NOW);
  const client = fakeClient({ prayer_requests: [
    prayer("before", { created_at: new Date(Date.parse(cutoff) - 1).toISOString() }),
    prayer("boundary", { created_at: cutoff }),
    prayer("a"), prayer("z"),
    prayer("now", { created_at: NOW.toISOString() }),
    prayer("future", { created_at: new Date(NOW.getTime() + 1).toISOString() }),
  ] });
  const overview = await helpers.loadPrayerOverview(client, NOW);
  assert.equal(overview.recentCount, 4);
  assert.deepEqual(overview.requests.map(({ id }) => id), ["future", "now", "z"]);
  assert.equal(overview.previewError, false);
  assert.deepEqual(client.calls[0].filters, [["gte", "created_at", cutoff], ["lte", "created_at", NOW.toISOString()]]);
  assert.deepEqual(client.calls[1].orders, [["created_at", { ascending: false }], ["id", { ascending: false }]]);
  assert.equal(client.calls[1].limit, 3);
  for (const { fields } of client.calls) assert.doesNotMatch(fields, /contact|\*/);
});

test("prayer counts and previews fail independently without converting errors into zero", async () => {
  for (const failure of [new Error("private connection details"), { data: null, count: null, error: { message: "private query details" } }]) {
    const countFailed = await helpers.loadPrayerOverview(fakeClient({ prayer_requests: [prayer("a")] }, { 0: failure }), NOW);
    assert.equal(countFailed.recentCount, null);
    assert.equal(countFailed.requests.length, 1);
    assert.equal(countFailed.previewError, false);
    const previewFailed = await helpers.loadPrayerOverview(fakeClient({ prayer_requests: [prayer("a")] }, { 1: failure }), NOW);
    assert.equal(previewFailed.recentCount, 1);
    assert.deepEqual(previewFailed.requests, []);
    assert.equal(previewFailed.previewError, true);
  }
  assert.deepEqual(await helpers.loadPrayerOverview(fakeClient(), NOW), { recentCount: 0, requests: [], previewError: false });
});

const cards = loadModule("src/components/admin_dashboard.tsx", {
  "next/link": { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) },
  "next/image": { __esModule: true, default: ({ fill, ...props }) => React.createElement("img", props) },
});
const renderCard = (component, overview) => renderToStaticMarkup(React.createElement(component, { overview }));

test("prayer cards escape long content, wrap names, omit contact and link to the specific request", () => {
  const html = renderCard(cards.PrayerOverviewCard, {
    recentCount: 1, previewError: false,
    requests: [prayer("a/b ?", { name: null, text: `First line\n<script>alert('x')</script>${"word".repeat(2000)}`, contact: "secret@example.com" })],
  });
  assert.match(html, /Name not provided/);
  assert.match(html, /First line\n&lt;script&gt;alert\(&#x27;x&#x27;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>|secret@example\.com|Contact:/);
  assert.match(html, /line-clamp-2/);
  assert.match(html, /\[overflow-wrap:anywhere\]/);
  assert.match(html, /Nov 7, 2026, 11:00 AM.*New York/);
  assert.match(html, /href="\/prayer-requests\?request=a%2Fb%20%3F#request-a%2Fb%20%3F"/);
  assert.match(html, /href="\/prayer-requests"/);
});

test("dashboard cards distinguish empty, count unavailable, and preview failure states", () => {
  const prayers = (overrides) => renderCard(cards.PrayerOverviewCard, { recentCount: 0, requests: [], previewError: false, ...overrides });
  assert.match(prayers({}), /No prayer requests yet/);
  assert.match(prayers({ recentCount: null, requests: [prayer("a")] }), /Count unavailable/);
  const failedPrayers = prayers({ previewError: true });
  assert.match(failedPrayers, /role="alert"/);
  assert.match(failedPrayers, /Prayer requests could not be loaded/);
  assert.doesNotMatch(failedPrayers, /No prayer requests yet/);
  const events = (overrides) => renderCard(cards.EventsOverviewCard, { counts: { Visible: 0, Scheduled: 0, Draft: 0, Expired: 0 }, events: [], previewError: false, today: "2026-11-07", ...overrides });
  assert.match(events({}), /No visible or scheduled announcements/);
  assert.match(events({ counts: { Visible: null, Scheduled: 0, Draft: 0, Expired: 0 } }), /Unavailable/);
  const failedEvents = events({ previewError: true });
  assert.match(failedEvents, /Event previews could not be loaded/);
  assert.doesNotMatch(failedEvents, /No visible or scheduled announcements/);
});

test("event cards link to editing and creation and label website dates explicitly", () => {
  const html = renderCard(cards.EventsOverviewCard, {
    counts: { Visible: 1, Scheduled: 0, Draft: 0, Expired: 0 },
    events: [event("event-id", { name: "<Youth & Families>" })], previewError: false, today: "2026-11-07",
  });
  assert.match(html, /href="\/events\/new"/);
  assert.match(html, /href="\/events\/event-id"/);
  assert.match(html, /href="\/events"/);
  assert.match(html, /&lt;Youth &amp; Families&gt;/);
  assert.match(html, /Website display/);
  assert.match(html, /Nov 1, 2026.*Nov 30, 2026/);
  assert.match(html, />Visible</);
  assert.doesNotMatch(html, />Live</);
});

test("each dashboard loading placeholder has an accessible, independent status", () => {
  for (const label of ["events", "prayer requests"]) {
    const html = renderToStaticMarkup(React.createElement(cards.DashboardPanelSkeleton, { label }));
    assert.match(html, new RegExp(`aria-label="Loading ${label}"`));
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /role="status"/);
  }
});

test("admin host routing exposes clean home/events paths and keeps internal routes off the public host", async () => {
  class Response {
    constructor(body, options = {}) { this.status = options.status ?? 200; this.cookies = { set() {} }; }
    static rewrite(url) { return { kind: "rewrite", url, cookies: { set() {} } }; }
    static redirect(url) { return { kind: "redirect", url, cookies: { set() {} } }; }
  }
  const { default: proxy } = loadModule("src/proxy.ts", {
    "next/server": { NextResponse: Response },
    "@supabase/ssr": { createServerClient: () => ({ auth: { getUser: async () => ({}) } }) },
    "next-intl/middleware": { __esModule: true, default: () => () => ({ kind: "public" }) },
    "./i18n/routing": { routing: {} },
  });
  const request = (pathname, host = "admin.bmcny.church") => ({
    headers: { get: () => host },
    nextUrl: { pathname, clone: () => new URL(`https://${host}${pathname}`) },
    cookies: { getAll: () => [], set() {} },
  });
  for (const pathname of ["/", "/events", "/events/new", "/events/event-id", "/prayer-requests"]) {
    const response = await proxy(request(pathname));
    assert.equal(response.kind, "rewrite");
    assert.equal(response.url.pathname, pathname === "/" ? "/admin" : `/admin${pathname}`);
  }
  const redirect = await proxy(request("/admin/events"));
  assert.equal(redirect.kind, "redirect");
  assert.equal(redirect.url.pathname, "/events");
  assert.equal((await proxy(request("/unknown"))).status, 404);
  assert.equal((await proxy(request("/admin/events", "bmcny.church"))).status, 404);
  assert.equal((await proxy(request("/", "bmcny.church"))).kind, "public");
});

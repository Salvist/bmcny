const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");

// Exercise the real server functions and proxy with isolated, in-memory clients.
function loadModule(relativePath, mocks) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports) { ${source}\n})`, { filename })(
    (id) => id in mocks ? mocks[id] : require(id), module, module.exports,
  );
  return module.exports;
}

function redirect(location) {
  throw Object.assign(new Error(`Redirect to ${location}`), { location });
}

function expectRedirect(fn, location) {
  return assert.rejects(fn, (error) => error.location === location);
}

function eventForm(overrides = {}, withImage = true) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: "Sunday Gathering", location: "New York", meeting_type: "onsite",
    start_date: "2026-11-08", end_date: "2026-11-08",
    display_start_date: "2026-11-01", display_end_date: "2026-11-08",
    recurrence_type: "continuous", is_published: "on", ...overrides,
  })) data.set(key, value);
  if (withImage) data.set("image", new File(["fixture-image"], "event.webp", { type: "image/webp" }));
  return data;
}

function actionHarness({ authorize, mutationError = null, signInError = null } = {}) {
  const calls = [];
  const revalidated = [];
  const supabase = {
    from(table) {
      calls.push(["table", table]);
      return {
        async insert(payload) { calls.push(["insert", payload]); return { error: mutationError }; },
        update(payload) {
          calls.push(["update", payload]);
          return { async eq(key, id) { calls.push(["update-id", key, id]); return { error: mutationError }; } };
        },
        delete() {
          return { async eq(key, id) { calls.push(["delete", key, id]); return { error: mutationError }; } };
        },
      };
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "event-images");
        return {
          async upload(imagePath) { calls.push(["upload", imagePath]); return { error: null }; },
          getPublicUrl(imagePath) { return { data: { publicUrl: `https://example.test/${imagePath}` } }; },
          async remove(paths) { calls.push(["remove", paths]); return { error: null }; },
        };
      },
    },
    auth: {
      async signInWithPassword(credentials) { calls.push(["signIn", credentials]); return { error: signInError }; },
      async signOut() { calls.push(["signOut"]); return { error: null }; },
    },
  };
  const actions = loadModule("src/app/admin/actions.ts", {
    "next/navigation": { redirect },
    "next/cache": { revalidatePath: (value) => revalidated.push(value) },
    "@/lib/auth": {
      async requireAdmin() {
        calls.push(["authorize"]);
        if (authorize) await authorize();
        return { supabase, user: { id: "admin-fixture" }, isAdmin: true };
      },
    },
    "@/lib/supabase/server": { createClient: async () => supabase },
  });
  return { actions, calls, revalidated };
}

test("creating an event returns to Events and refreshes public, Home and Events pages", async () => {
  const { actions, calls, revalidated } = actionHarness();
  await expectRedirect(() => actions.createEvent({}, eventForm()), "/events");
  assert.equal(calls[0][0], "authorize");
  const payload = calls.find(([operation]) => operation === "insert")[1];
  assert.equal(payload.name, "Sunday Gathering");
  assert.equal(payload.is_published, true);
  assert.match(payload.image_path, /^admin-fixture\/.+\.webp$/);
  assert.deepEqual(revalidated, ["/", "/admin", "/admin/events"]);
});

test("editing an event preserves its image unless replaced and returns to Events", async () => {
  const { actions, calls, revalidated } = actionHarness();
  await expectRedirect(() => actions.updateEvent({}, eventForm({ id: "event-fixture" }, false)), "/events");
  assert.deepEqual(calls.find(([operation]) => operation === "update-id"), ["update-id", "id", "event-fixture"]);
  assert.ok(!calls.some(([operation]) => operation === "upload" || operation === "remove"));
  assert.deepEqual(revalidated, ["/", "/admin", "/admin/events", "/admin/events/event-fixture"]);

  const replaced = actionHarness();
  await expectRedirect(() => replaced.actions.updateEvent({}, eventForm({
    id: "event-fixture", current_image_path: "admin-fixture/old.webp",
  })), "/events");
  assert.deepEqual(replaced.calls.find(([operation]) => operation === "remove"), ["remove", ["admin-fixture/old.webp"]]);
});

test("all event mutations require authorization before accessing storage or data", async () => {
  for (const action of ["createEvent", "updateEvent", "toggleEvent", "deleteEvent"]) {
    const { actions, calls, revalidated } = actionHarness({ authorize: async () => { throw new Error("Unauthorized"); } });
    await assert.rejects(() => ["createEvent", "updateEvent"].includes(action)
      ? actions[action]({}, eventForm({ id: "event-fixture" }))
      : actions[action](eventForm({ id: "event-fixture" })), /Unauthorized/);
    assert.deepEqual(calls, [["authorize"]]);
    assert.deepEqual(revalidated, []);
  }
});

test("validation and persistence failures stay on the form without invalidating pages", async () => {
  const invalid = actionHarness();
  assert.deepEqual(await invalid.actions.createEvent({}, eventForm({ name: " " })), { error: "Event name is required." });
  assert.deepEqual(invalid.calls, [["authorize"]]);
  assert.deepEqual(invalid.revalidated, []);

  for (const action of ["createEvent", "updateEvent"]) {
    const { actions, revalidated } = actionHarness({ mutationError: { message: "private database details" } });
    const result = await actions[action]({}, eventForm({ id: "event-fixture" }));
    assert.match(result.error, /Please try again/);
    assert.doesNotMatch(result.error, /private database details/);
    assert.deepEqual(revalidated, []);
  }
});

test("publishing and deleting refresh the dashboard and the affected event", async () => {
  const published = actionHarness();
  await published.actions.toggleEvent(eventForm({ id: "event-fixture", is_published: "false" }, false));
  assert.deepEqual(published.calls.find(([operation]) => operation === "update"), ["update", { is_published: true }]);
  assert.deepEqual(published.revalidated, ["/", "/admin", "/admin/events", "/admin/events/event-fixture"]);

  const deleted = actionHarness();
  await deleted.actions.deleteEvent(eventForm({ id: "event-fixture", image_path: "admin-fixture/event.webp" }, false));
  assert.deepEqual(deleted.calls.find(([operation]) => operation === "delete"), ["delete", "id", "event-fixture"]);
  assert.deepEqual(deleted.calls.find(([operation]) => operation === "remove"), ["remove", ["admin-fixture/event.webp"]]);
  assert.deepEqual(deleted.revalidated, published.revalidated);
});

test("sign-in and sign-out use clean admin-host addresses", async () => {
  const credentials = new FormData();
  credentials.set("email", "admin@example.test");
  credentials.set("password", "fixture-password");
  const allowed = actionHarness();
  await expectRedirect(() => allowed.actions.signIn(credentials), "/");
  assert.ok(allowed.calls.some(([operation]) => operation === "authorize"));
  await expectRedirect(() => allowed.actions.signOut(), "/login");
  assert.ok(allowed.calls.some(([operation]) => operation === "signOut"));

  await expectRedirect(() => actionHarness().actions.signIn(new FormData()), "/login?error=missing");
  await expectRedirect(() => actionHarness({ signInError: { message: "bad credentials" } }).actions.signIn(credentials), "/login?error=credentials");
  await expectRedirect(() => actionHarness({ authorize: () => redirect("/login?error=unauthorized") }).actions.signIn(credentials), "/login?error=unauthorized");
});

function proxyHarness() {
  let refreshes = 0;
  const { default: proxy } = loadModule("src/proxy.ts", {
    "@supabase/ssr": {
      createServerClient(_url, _key, options) {
        return { auth: { async getUser() {
          refreshes += 1;
          options.cookies.setAll([{ name: "fixture-session", value: "refreshed", options: { httpOnly: true } }]);
          return { data: { user: null } };
        } } };
      },
    },
    "next-intl/middleware": { __esModule: true, default: () => () => new NextResponse(null, { headers: { "x-fixture-public": "true" } }) },
    "./i18n/routing": { routing: {} },
  });
  return { proxy, get refreshes() { return refreshes; } };
}

function request(hostname, pathname) {
  return new NextRequest(`http://${hostname}${pathname}`, { headers: { host: hostname } });
}

test("admin-host clean routes rewrite to authenticated pages and preserve sessions", async () => {
  const harness = proxyHarness();
  for (const hostname of ["admin.localhost:3000", "admin.bmcny.church"]) {
    for (const pathname of ["/", "/events", "/events/new", "/events/event-fixture", "/prayer-requests?page=2", "/login"]) {
      const response = await harness.proxy(request(hostname, pathname));
      const rewritten = new URL(response.headers.get("x-middleware-rewrite"));
      assert.equal(rewritten.pathname, pathname === "/" ? "/admin" : `/admin${pathname.split("?")[0]}`);
      assert.equal(rewritten.search, pathname.includes("?") ? "?page=2" : "");
      assert.equal(response.cookies.get("fixture-session").value, "refreshed");
    }
  }
  assert.equal(harness.refreshes, 12);
});

test("old admin-prefixed addresses redirect to clean URLs on the admin host", async () => {
  const harness = proxyHarness();
  for (const pathname of ["/admin", "/admin/events", "/admin/events/event-fixture?from=home"]) {
    const response = await harness.proxy(request("admin.localhost:3000", pathname));
    const destination = new URL(response.headers.get("location"));
    assert.equal(response.status, 307);
    assert.equal(destination.pathname, pathname === "/admin" ? "/" : pathname.split("?")[0].slice(6));
    assert.equal(destination.search, pathname.includes("?") ? "?from=home" : "");
  }
  assert.equal(harness.refreshes, 0);
});

test("admin routes remain unavailable on the public host and unknown admin pages return 404", async () => {
  const harness = proxyHarness();
  for (const pathname of ["/admin", "/admin/events", "/admin/events/new", "/admin/prayer-requests"]) {
    const response = await harness.proxy(request("bmcny.church", pathname));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
  }
  assert.equal((await harness.proxy(request("admin.localhost:3000", "/unknown"))).status, 404);
  assert.equal((await harness.proxy(request("bmcny.church", "/"))).headers.get("x-fixture-public"), "true");
  assert.equal(harness.refreshes, 0);
});

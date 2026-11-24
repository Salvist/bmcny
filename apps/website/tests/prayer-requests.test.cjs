const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Load server modules with a fake Supabase client; tests never use live credentials.
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
  run(
    (id) => {
      if (id in mocks) return mocks[id];
      if (id.startsWith("@/"))
        return loadModule(`src/${id.slice(2)}.ts`, mocks);
      return require(id);
    },
    module,
    module.exports,
  );
  return module.exports;
}

const { validatePrayerRequest } = loadModule("src/lib/prayer-requests.ts");

function form(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: "",
    email: "visitor@example.com",
    phone_number: "",
    text: "Please pray for our family.\nThank you.",
    ...overrides,
  }))
    data.set(key, value);
  return data;
}

test("an email and prayer are sufficient without a name", () => {
  const result = validatePrayerRequest(form());
  assert.deepEqual(result.fieldErrors, {});
  assert.equal(result.values.name, "");
});

test("names and contacts are trimmed while prayer line breaks remain", () => {
  const { values } = validatePrayerRequest(
    form({
      name: "  Visitor  ",
      email: " visitor@example.com ",
      text: "  First line\nSecond line  ",
    }),
  );
  assert.deepEqual(values, {
    name: "Visitor",
    email: "visitor@example.com",
    phone_number: "",
    text: "First line\nSecond line",
  });
});

test("phone only and both contact methods are accepted", () => {
  for (const phone_number of ["+1 (212) 555-0123", "0812-3456-7890", "1234567", "+123456789012345"]) {
    assert.deepEqual(validatePrayerRequest(form({ email: "", phone_number })).fieldErrors, {});
    assert.deepEqual(validatePrayerRequest(form({ phone_number })).fieldErrors, {});
  }
});
test("each supplied contact is validated even when the other is valid", () => {
  for (const email of ["name@", "name@example", "hello"]) assert.equal(validatePrayerRequest(form({ email, phone_number: "1234567" })).fieldErrors.email, "emailInvalid");
  for (const phone_number of ["123456", "1234567890123456", "212-CALL-NOW", "++12125550123"]) assert.equal(validatePrayerRequest(form({ phone_number })).fieldErrors.phone_number, "phoneInvalid");
  assert.deepEqual(validatePrayerRequest(form({ email: " ", text: " " })).fieldErrors, { email: "contactRequired", phone_number: "contactRequired", text: "prayerRequired" });
});
test("length limits are enforced", () => {
  const boundary = { name: "n".repeat(120), email: "a".repeat(242) + "@example.com", text: "p".repeat(5000) };
  assert.deepEqual(validatePrayerRequest(form(boundary)).fieldErrors, {});
  assert.deepEqual(validatePrayerRequest(form({ name: boundary.name + "n", email: boundary.email + "m", text: boundary.text + "p", phone_number: "1".repeat(255) })).fieldErrors, { name: "nameTooLong", email: "emailTooLong", text: "prayerTooLong", phone_number: "phoneTooLong" });
});

function actionWithClient(createClient) {
  return loadModule("src/app/[locale]/prayer-request/actions.ts", {
    "@/lib/supabase/server": { createClient },
  }).submitPrayerRequest;
}

test("validation failures never access the database", async () => {
  const submit = actionWithClient(() => {
    throw new Error("Database must not be called");
  });
  const result = await submit(
    { status: "idle" },
    form({ text: " " }),
  );
  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors.text, "prayerRequired");
  assert.equal(result.error, undefined);
});

test("successful submissions insert trimmed values, null name and no returned row", async () => {
  let saved;
  const submit = actionWithClient(async () => ({
    from(table) {
      assert.equal(table, "prayer_requests");
      return {
        async insert(payload) {
          saved = payload;
          return { error: null };
        },
      };
    },
  }));
  const result = await submit(
    { status: "idle" },
    form({ name: " ", email: " visitor@example.com " }),
  );
  assert.deepEqual(result, { status: "success" });
  assert.deepEqual(saved, {
    name: null,
    email: "visitor@example.com",
    phone_number: null,
    text: "Please pray for our family.\nThank you.",
  });
});

test("database errors and connection exceptions return only a friendly error code", async () => {
  for (const createClient of [
    async () => ({
      from: () => ({
        insert: async () => ({
          error: { message: "private database details" },
        }),
      }),
    }),
    async () => {
      throw new Error("private connection details");
    },
  ]) {
    const result = await actionWithClient(createClient)(
      { status: "idle" },
      form(),
    );
    assert.deepEqual(result, { status: "error", error: "storageError" });
  }
});

test("English and Indonesian contain matching prayer form and error messages", () => {
  const en = require("../src/messages/en.json");
  const id = require("../src/messages/id.json");
  assert.deepEqual(
    Object.keys(en.prayerRequest).sort(),
    Object.keys(id.prayerRequest).sort(),
  );
  assert.deepEqual(
    Object.keys(en.prayerRequest.errors).sort(),
    Object.keys(id.prayerRequest.errors).sort(),
  );
  assert.ok(en.nav.prayerRequest && id.nav.prayerRequest);
});

async function renderInbox(response, page, requireAdminOverride, focus = {}) {
  let range;
  const queries = [];
  const from = (table) => {
    assert.equal(table, "prayer_requests");
    const call = { orders: [] };
    queries.push(call);
    return {
      select(fields, options) {
        call.fields = fields;
        call.options = options;
        return this;
      },
      eq(field, value) {
        call.eq = [field, value];
        return this;
      },
      maybeSingle() {
        call.maybeSingle = true;
        return Promise.resolve(focus.targetResponse ?? { data: null, error: null });
      },
      or(filter) {
        call.or = filter;
        return Promise.resolve(focus.precedingResponse ?? { count: 0, error: null });
      },
      order(field, options) {
        call.orders.push([field, options]);
        return this;
      },
      range(start, end) {
        range = [start, end];
        call.range = range;
        return Promise.resolve(response);
      },
    };
  };
  const { default: Inbox } = loadModule(
    "src/app/admin/(workspace)/prayer-requests/page.tsx",
    {
      "@/lib/auth": {
        requireAdmin:
          requireAdminOverride ??
          (async () => ({ supabase: { from } })),
      },
      "./prayer_request_editor": loadModule("src/app/admin/(workspace)/prayer-requests/prayer_request_editor.tsx", {
        "./actions": { updatePrayerRequest: async () => ({ status: "success" }) },
      }),
      "next/link": {
        __esModule: true,
        default: ({ children, ...props }) =>
          require("react").createElement("a", props, children),
      },
    },
  );
  const element = await Inbox({ searchParams: Promise.resolve({ page, request: focus.request }) });
  return {
    html: require("react-dom/server").renderToStaticMarkup(element),
    range,
    queries,
  };
}

const inboxFixture = {
  id: "test-id",
  name: null,
  email: "visitor@example.com",
  phone_number: null,
  text: "First line\n<script>literal text</script>",
  created_at: "2026-11-07T17:00:00Z",
  updated_at: "2026-11-07T17:00:00Z",
  status: "pending",
  notes: null,
};

test("the admin inbox renders private entries, optional names and New York times", async () => {
  const { html, range } = await renderInbox({
    data: [inboxFixture],
    count: 51,
    error: null,
  });
  assert.deepEqual(range, [0, 49]);
  assert.match(html, /Name not provided/);
  assert.match(html, /visitor@example.com/);
  assert.match(html, /Nov 7, 2026, 12:00 PM/);
  assert.match(html, /First line\n&lt;script&gt;literal text&lt;\/script&gt;/);
  assert.match(html, /href="\/prayer-requests\?page=2"/);
});

test("pagination shows the second batch and sanitizes invalid page parameters", async () => {
  const { html, range } = await renderInbox(
    { data: [inboxFixture], count: 51, error: null },
    "2",
  );
  assert.deepEqual(range, [50, 99]);
  assert.match(html, /href="\/prayer-requests\?page=1"/);
  assert.doesNotMatch(html, />Next</);
  for (const page of [
    "-2",
    "0",
    "abc",
    "2.5",
    "99999999999999999999",
    ["2", "3"],
  ]) {
    assert.deepEqual(
      (await renderInbox({ data: [], count: 0, error: null }, page)).range,
      [0, 49],
    );
  }
});

test("the inbox provides empty and friendly error states", async () => {
  assert.match(
    (await renderInbox({ data: [], count: 0, error: null })).html,
    /No prayer requests have been submitted yet/,
  );
  const { html } = await renderInbox({
    data: null,
    count: null,
    error: { message: "private database details" },
  });
  assert.match(html, /Prayer requests could not be loaded/);
  assert.doesNotMatch(html, /private database details/);
});

test("the inbox requires authorization before reading submissions", async () => {
  await assert.rejects(
    () =>
      renderInbox({}, "1", async () => {
        throw new Error("Unauthorized");
      }),
    /Unauthorized/,
  );
});

const focusedRequest = {
  id: "12345678-1234-1234-1234-123456789abc",
  created_at: "2026-11-01T17:00:00+00:00",
};

test("a focused request resolves its current page using timestamp and id ordering", async () => {
  const { html, range, queries } = await renderInbox(
    { data: [{ ...inboxFixture, ...focusedRequest }], count: 151, error: null },
    "1",
    undefined,
    {
      request: focusedRequest.id,
      targetResponse: { data: focusedRequest, error: null },
      precedingResponse: { count: 101, error: null },
    },
  );
  assert.deepEqual(range, [100, 149]);
  assert.equal(queries.length, 3);
  assert.equal(queries[0].fields, "id, created_at");
  assert.deepEqual(queries[0].eq, ["id", focusedRequest.id]);
  assert.equal(queries[0].maybeSingle, true);
  assert.deepEqual(queries[1].options, { count: "exact", head: true });
  assert.equal(
    queries[1].or,
    `created_at.gt.${focusedRequest.created_at},and(created_at.eq.${focusedRequest.created_at},id.gt.${focusedRequest.id})`,
  );
  assert.deepEqual(queries[2].orders, [["created_at", { ascending: false }], ["id", { ascending: false }]]);
  assert.match(html, /Page 3/);
  assert.match(html, new RegExp(`id="request-${focusedRequest.id}"`));
  assert.match(html, /href="\/prayer-requests\?page=2"/);
  assert.match(html, /href="\/prayer-requests\?page=4"/);
});

test("focused request pages change exactly at the 50-row boundary", async () => {
  for (const [preceding, expectedRange] of [
    [0, [0, 49]],
    [49, [0, 49]],
    [50, [50, 99]],
    [99, [50, 99]],
    [100, [100, 149]],
  ]) {
    const { range } = await renderInbox(
      { data: [], count: 151, error: null },
      "9",
      undefined,
      {
        request: focusedRequest.id,
        targetResponse: { data: focusedRequest, error: null },
        precedingResponse: { count: preceding, error: null },
      },
    );
    assert.deepEqual(range, expectedRange, `${preceding} newer requests`);
  }
});

test("missing or unavailable focused requests fall back to latest submissions with friendly notices", async () => {
  for (const scenario of [
    { targetResponse: { data: null, error: null }, notice: /This request is no longer available/, queryCount: 2 },
    { targetResponse: { data: null, error: { message: "private lookup details" } }, notice: /This request could not be located/, queryCount: 2 },
    { targetResponse: { data: focusedRequest, error: null }, precedingResponse: { count: null, error: { message: "private count details" } }, notice: /This request could not be located/, queryCount: 3 },
    { targetResponse: { data: focusedRequest, error: null }, precedingResponse: { count: null, error: null }, notice: /This request could not be located/, queryCount: 3 },
  ]) {
    const { html, range, queries } = await renderInbox(
      { data: [inboxFixture], count: 1, error: null },
      "6",
      undefined,
      { request: focusedRequest.id, ...scenario },
    );
    assert.deepEqual(range, [0, 49]);
    assert.equal(queries.length, scenario.queryCount);
    assert.match(html, scenario.notice);
    assert.match(html, /Showing the latest submissions/);
    assert.match(html, /role="status"/);
    assert.match(html, /visitor@example\.com/);
    assert.doesNotMatch(html, /private lookup details|private count details/);
  }
});

test("malformed focused request parameters never enter lookup or count filters", async () => {
  for (const request of [
    undefined, "", "not-a-uuid", `${focusedRequest.id},id.gt.anything`,
    `${focusedRequest.id}'`, [focusedRequest.id], [focusedRequest.id, focusedRequest.id],
  ]) {
    const { html, range, queries } = await renderInbox(
      { data: [inboxFixture], count: 51, error: null },
      "2",
      undefined,
      { request },
    );
    assert.deepEqual(range, [50, 99]);
    assert.equal(queries.length, 1);
    assert.equal(queries[0].eq, undefined);
    assert.equal(queries[0].or, undefined);
    assert.equal(queries[0].maybeSingle, undefined);
    assert.doesNotMatch(html, /This request could not be located|This request is no longer available/);
  }
});

function updateAction(requireAdmin, revalidatePath = () => {}) {
  return loadModule("src/app/admin/(workspace)/prayer-requests/actions.ts", {
    "@/lib/auth": { requireAdmin },
    "next/cache": { revalidatePath },
  }).updatePrayerRequest;
}

function updateForm(status, notes = "") {
  const data = new FormData();
  data.set("status", status);
  data.set("notes", notes);
  data.set("text", "Untrusted replacement");
  return data;
}

test("admin saves allow all statuses and send only status and trimmed notes", async () => {
  for (const status of ["pending", "ongoing", "prayed", "rejected"]) {
    let saved;
    const refreshed = [];
    const update = updateAction(async () => ({ supabase: { from(table) {
      assert.equal(table, "prayer_requests");
      return { update(payload) { saved = payload; return this; },
        eq(field, value) { assert.equal(field, "id"); assert.equal(value, focusedRequest.id); return this; },
        select(fields) { assert.equal(fields, "id"); return this; },
        maybeSingle: async () => ({ data: { id: focusedRequest.id }, error: null }),
      };
    } } }), (path) => refreshed.push(path));
    assert.deepEqual(await update(focusedRequest.id, { status: "idle" }, updateForm(status, "  Follow up\nTomorrow  ")), { status: "success" });
    assert.deepEqual(saved, { status, notes: "Follow up\nTomorrow" });
    assert.deepEqual(refreshed, ["/admin/prayer-requests"]);
  }
});

test("admin update requires authorization before database access", async () => {
  const update = updateAction(async () => { throw new Error("Unauthorized"); });
  await assert.rejects(() => update(focusedRequest.id, { status: "idle" }, updateForm("pending")), /Unauthorized/);
});

test("invalid statuses, identifiers and oversized notes never reach the database", async () => {
  const update = updateAction(async () => ({ supabase: { from() { throw new Error("Database must not be called"); } } }));
  for (const [id, status, notes] of [[focusedRequest.id, "invalid", ""], ["invalid-id", "pending", ""], [focusedRequest.id, "pending", "n".repeat(5001)]]) {
    const result = await update(id, { status: "idle" }, updateForm(status, notes));
    assert.equal(result.status, "error");
    assert.match(result.error, /Choose a valid status/);
  }
});

test("missing rows, database failures and exceptions show friendly save errors", async () => {
  for (const response of [{ data: null, error: null }, { data: null, error: { message: "private details" } }, new Error("private connection")]) {
    const update = updateAction(async () => ({ supabase: { from() { return {
      update() { return this; }, eq() { return this; }, select() { return this; },
      async maybeSingle() { if (response instanceof Error) throw response; return response; },
    }; } } }), () => { throw new Error("Failed saves must not refresh"); });
    const result = await update(focusedRequest.id, { status: "idle" }, updateForm("pending"));
    assert.deepEqual(result, { status: "error", error: "Could not save this request. Please try again." });
  }
});

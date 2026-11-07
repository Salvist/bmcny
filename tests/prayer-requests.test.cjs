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
    contact: "visitor@example.com",
    prayer_request: "Please pray for our family.\nThank you.",
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
      contact: " visitor@example.com ",
      prayer_request: "  First line\nSecond line  ",
    }),
  );
  assert.deepEqual(values, {
    name: "Visitor",
    contact: "visitor@example.com",
    prayer_request: "First line\nSecond line",
  });
});

test("formatted local and international phone numbers are accepted", () => {
  for (const contact of [
    "+1 (212) 555-0123",
    "0812-3456-7890",
    "1234567",
    "+123456789012345",
  ]) {
    assert.deepEqual(
      validatePrayerRequest(form({ contact })).fieldErrors,
      {},
      contact,
    );
  }
});

test("invalid email addresses, phone numbers and whitespace are rejected", () => {
  for (const contact of [
    "name@",
    "name@example",
    "hello",
    "123456",
    "1234567890123456",
    "212-CALL-NOW",
    "++12125550123",
  ]) {
    assert.equal(
      validatePrayerRequest(form({ contact })).fieldErrors.contact,
      "contactInvalid",
      contact,
    );
  }
  assert.deepEqual(
    validatePrayerRequest(form({ contact: " \t", prayer_request: " \n " }))
      .fieldErrors,
    {
      contact: "contactRequired",
      prayer_request: "prayerRequired",
    },
  );
});

test("length boundaries are accepted and oversized fields are rejected", () => {
  const boundary = {
    name: "n".repeat(120),
    contact: `${"a".repeat(242)}@example.com`,
    prayer_request: "p".repeat(5000),
  };
  assert.deepEqual(validatePrayerRequest(form(boundary)).fieldErrors, {});
  assert.deepEqual(
    validatePrayerRequest(
      form({
        name: `${boundary.name}n`,
        contact: `${boundary.contact}m`,
        prayer_request: `${boundary.prayer_request}p`,
      }),
    ).fieldErrors,
    {
      name: "nameTooLong",
      contact: "contactTooLong",
      prayer_request: "prayerTooLong",
    },
  );
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
    form({ prayer_request: " " }),
  );
  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors.prayer_request, "prayerRequired");
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
    form({ name: " ", contact: " visitor@example.com " }),
  );
  assert.deepEqual(result, { status: "success" });
  assert.deepEqual(saved, {
    name: null,
    contact: "visitor@example.com",
    prayer_request: "Please pray for our family.\nThank you.",
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

async function renderInbox(response, page, requireAdminOverride) {
  let range;
  const query = {
    select() {
      return this;
    },
    order() {
      return this;
    },
    range(start, end) {
      range = [start, end];
      return Promise.resolve(response);
    },
  };
  const { default: Inbox } = loadModule(
    "src/app/admin/prayer-requests/page.tsx",
    {
      "@/lib/auth": {
        requireAdmin:
          requireAdminOverride ??
          (async () => ({ supabase: { from: () => query } })),
      },
      "next/link": {
        __esModule: true,
        default: ({ children, ...props }) =>
          require("react").createElement("a", props, children),
      },
    },
  );
  const element = await Inbox({ searchParams: Promise.resolve({ page }) });
  return {
    html: require("react-dom/server").renderToStaticMarkup(element),
    range,
  };
}

const inboxFixture = {
  id: "test-id",
  name: null,
  contact: "visitor@example.com",
  prayer_request: "First line\n<script>literal text</script>",
  created_at: "2026-11-07T17:00:00Z",
};

test("the admin inbox renders private entries, optional names and New York times", async () => {
  const { html, range } = await renderInbox({
    data: [inboxFixture],
    count: 51,
    error: null,
  });
  assert.deepEqual(range, [0, 49]);
  assert.match(html, /Not provided/);
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

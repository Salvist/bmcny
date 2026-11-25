/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness for the browser TypeScript modules. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

// Load the same client-side model the scheduling screens use.
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};
const { bulletin, emptyDemo, restoreDemo } = require("../src/app/model/bulletin.ts");
const { assignments, publish, rosterKey, scheduleData, switchMember, warnings } = require("../src/app/model/scheduling.ts");

const data = bulletin(new Date("2026-11-24T17:00:00Z"));
const published = demo => scheduleData(data, demo.scheduling).rosters;
const reload = demo => restoreDemo(JSON.parse(JSON.stringify(demo)));

test("first Sunday has two independent assignments, followed by an off-duty Music roster", () => {
  const demo = emptyDemo();
  const rosters = published(demo);
  const shifts = assignments(rosters, "alex");
  const [zoom, music] = shifts;
  assert.deepEqual([zoom.arrival, music.arrival], [585, 1035]);
  assert.equal(zoom.date, music.date);
  assert.deepEqual(shifts.filter(s => s.category === "Music").map(s => s.title), ["Keyboard"]);
  assert.deepEqual(rosters[music.rosterId].duties.map(d => d.member), ["alex", "maya"]);
  const nextMusic = Object.values(rosters).find(r => r.department === "Music" && r.gathering.date > music.date);
  assert.ok(nextMusic);
  assert.ok(!shifts.some(s => s.rosterId === rosterKey("Music", nextMusic.gathering)));
  const updated = publish(publish(demo, rosters[zoom.rosterId], rosters, false), rosters[music.rosterId], rosters, false);
  updated.shifts[music.id] = "Confirmed";
  assert.equal(updated.shifts[zoom.id] ?? zoom.initial, "Pending");
});

test("draft replacement stays private until publication, and starts pending after reload", () => {
  let demo = emptyDemo();
  const rosters = published(demo);
  const music = assignments(rosters, "alex").find(s => s.category === "Music");
  demo.shifts[music.id] = "Coverage requested";
  demo = switchMember(demo, "jo", true);
  const draft = structuredClone(rosters[music.rosterId]);
  draft.duties[0].member = "sam";
  demo.scheduling.drafts[music.rosterId] = draft;
  demo = reload(demo);
  assert.equal(published(demo)[music.rosterId].duties[0].member, "alex");
  assert.equal(demo.shifts[music.id], "Coverage requested");
  demo = reload(publish(demo, draft, published(demo), false));
  assert.equal(demo.scheduling.drafts[music.rosterId], undefined);
  assert.equal(demo.shifts[music.id], "Pending");
  assert.ok(!assignments(published(demo), "alex").some(s => s.id === music.id));
  assert.ok(assignments(published(demo), "sam").some(s => s.id === music.id));
});

test("overlaps use full serving intervals and availability follows the volunteer", () => {
  let demo = emptyDemo();
  const rosters = published(demo);
  const [zoom, music] = assignments(rosters, "alex");
  const draft = structuredClone(rosters[zoom.rosterId]);
  assert.deepEqual(warnings(draft, rosters, demo), []);
  draft.duties[0].finish = music.arrival;
  assert.deepEqual(warnings(draft, rosters, demo), []);
  draft.duties[0].finish++;
  demo.unavailable = [music.date];
  demo = switchMember(demo, "jo", true);
  assert.deepEqual(demo.unavailable, []);
  const alerts = warnings(draft, rosters, demo);
  assert.ok(alerts.some(s => s.includes("Keyboard") && s.includes("5:15 PM")));
  assert.ok(alerts.some(s => s.includes("unavailable")));
  assert.equal(publish(demo, draft, rosters, false), demo);
  assert.equal(published(publish(demo, draft, rosters, true))[zoom.rosterId].duties[0].finish, 1036);
});

test("member data survives a reload and preview persona changes", () => {
  const alex = emptyDemo();
  const assignment = assignments(published(alex), "alex")[0];
  const lunch = data.events.find(event => event.title === "Community Lunch");
  alex.shifts[assignment.id] = "Confirmed";
  alex.saved[data.worship.id] = data.worship;
  alex.registrations[lunch.id] = { item: lunch, person: { name: "Alex", email: "alex@example.com" } };
  alex.unavailable = [data.today];

  const demo = switchMember(reload(switchMember(alex, "sam", false)), "alex", false);
  for (const field of ["saved", "shifts", "registrations", "unavailable"]) {
    assert.deepEqual(demo[field], alex[field]);
  }
});

test("Zoom roster is still available during Sunday worship in New York", () => {
  const during = bulletin(new Date("2026-11-29T15:20:00Z"));
  assert.ok(assignments(scheduleData(during, emptyDemo().scheduling).rosters, "alex")
    .some(s => s.date === during.today && s.title === "Zoom operator" && s.finish > during.minute));
});

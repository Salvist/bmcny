"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { dateLabel, time } from "@/app/model/bulletin";
import { departmentFrom, rosterKey } from "@/app/model/scheduling";
import { RosterEditor } from "../../components/roster-editor";
import { ServingShell } from "../../components/serving-shell";

function EditRoster() {
  const params = useSearchParams();
  const department = departmentFrom(params.get("department"));
  const { demo, change, rosters, gatherings } = useCommunity();
  const gathering = gatherings.find((g) => g.id === params.get("gathering"));
  const back = "/serving/rosters?department=" + encodeURIComponent(department);
  if (!gathering) {
    return (
      <div className="empty">
        <h3>Gathering not found</h3>
        <Link className="text-btn" href={back}>Back to rosters</Link>
      </div>
    );
  }
  const key = rosterKey(department, gathering);
  const roster = demo.scheduling.drafts[key] ?? rosters[key] ?? { department, gathering, duties: [] };
  return (
    <section className="serving-section">
      <Link className="text-btn" href={back}>Back to rosters</Link>
      <h2>{gathering.title}</h2>
      <p className="meta">{department} · {dateLabel(gathering.date, { weekday: "short", month: "short", day: "numeric" })} · {time(gathering.minutes)} ET</p>
      {demo.scheduling.drafts[key] && <p className="tag">Saved draft</p>}
      <RosterEditor key={key} roster={roster} demo={demo} published={rosters} change={change} />
    </section>
  );
}

export default function EditRosterPage() {
  return (
    <ServingShell leaderOnly>
      <Suspense fallback={<BulletinLoading />}>
        <EditRoster />
      </Suspense>
    </ServingShell>
  );
}

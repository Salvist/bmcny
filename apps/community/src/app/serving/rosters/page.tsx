"use client";

import { Suspense } from "react";
import { BulletinLoading } from "@/app/components/community-app";
import { DepartmentPicker, useDepartment } from "../components/department-picker";
import { RosterOverview } from "../components/roster-overview";
import { ServingShell } from "../components/serving-shell";

function Rosters() {
  const department = useDepartment();
  return (
    <section className="serving-section">
      <div className="section-head">
        <h2>Rosters</h2>
        <DepartmentPicker department={department} />
      </div>
      <RosterOverview department={department} />
    </section>
  );
}

export default function RostersPage() {
  return (
    <ServingShell leaderOnly>
      <Suspense fallback={<BulletinLoading />}>
        <Rosters />
      </Suspense>
    </ServingShell>
  );
}

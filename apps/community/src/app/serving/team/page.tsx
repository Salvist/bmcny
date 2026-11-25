"use client";

import { Suspense } from "react";
import { BulletinLoading } from "@/app/components/community-app";
import { DepartmentMembers } from "../components/department-members";
import { DepartmentPicker, useDepartment } from "../components/department-picker";
import { ServingShell } from "../components/serving-shell";

function Team() {
  const department = useDepartment();
  return (
    <section className="serving-section">
      <div className="section-head">
        <h2>Team</h2>
        <DepartmentPicker department={department} />
      </div>
      <DepartmentMembers department={department} />
    </section>
  );
}

export default function TeamPage() {
  return (
    <ServingShell leaderOnly>
      <Suspense fallback={<BulletinLoading />}>
        <Team />
      </Suspense>
    </ServingShell>
  );
}

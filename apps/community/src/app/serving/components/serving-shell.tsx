"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { directory } from "@/app/model/scheduling";
import { ServingNavigation } from "./serving-navigation";

export function ServingShell({ leaderOnly = false, children }: { leaderOnly?: boolean; children: ReactNode }) {
  const { data, demo, provider, signIn, preview } = useCommunity();
  const router = useRouter();
  const blocked = leaderOnly && !!data && !!provider && !demo.scheduling.leader;
  useEffect(() => {
    if (blocked) router.replace("/serving");
  }, [blocked, router]);
  if (!data) return <BulletinLoading />;
  if (!provider) return <ProfileSignIn onContinue={signIn} />;
  if (blocked) return <BulletinLoading />;
  const persona = demo.volunteer
    ? (demo.scheduling.leader ? "Department leader" : directory[demo.scheduling.member]) + " · Switch view"
    : "Explore volunteer scheduling";
  return (
    <>
      <div className="schedule-toolbar">
        <Link href="/profile" className="text-btn">Back to Profile</Link>
        {demo.volunteer && <button className="secondary" onClick={preview}>{persona}</button>}
      </div>
      {demo.scheduling.leader && (
        <Suspense fallback={null}>
          <ServingNavigation />
        </Suspense>
      )}
      {children}
    </>
  );
}

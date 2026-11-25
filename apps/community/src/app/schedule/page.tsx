"use client";

import Link from "next/link";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { Rows } from "@/app/components/rows";
import { directory } from "@/app/model/scheduling";

export default function SchedulePage() {
  const { data, demo, provider, scheduleItems, signIn, preview, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  const attending = scheduleItems.filter(i => i.kind !== "Assignment");
  return (
    <>
      <div className="schedule-toolbar">
        <Link href="/profile" className="text-btn">Back to Profile</Link>
        <button className="secondary" onClick={preview}>
          {demo.volunteer
            ? (demo.scheduling.leader ? "Department leader" : directory[demo.scheduling.member]) + " · Switch view"
            : "Explore volunteer scheduling"}
        </button>
      </div>
      <section>
        <div className="section-head">
          <h2>Your agenda</h2>
        </div>
        {attending.length ? (
          <Rows items={attending} demo={demo} open={setItem} />
        ) : (
          <div className="empty">
            <Icon name="schedule" size={30} />
            <h3>Your schedule is open</h3>
            <p>
              Save a gathering or register for an event to see it here.
            </p>
            <div className="actions">
              <Link href="/events" className="primary">
                Browse events
              </Link>
              <Link href="/services" className="secondary">
                Browse services
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { Rows } from "@/app/components/rows";
import { MemberPage } from "./components/member-profile";

export default function ProfilePage() {
  const { data, demo, provider, personalShifts, scheduleItems, signIn, change, preview, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  const upcoming = (entry: { date: string; arrival?: number; minutes: number }) =>
    entry.date > data.today || (entry.date === data.today && (entry.arrival ?? entry.minutes) >= data.minute);
  const nextGathering = scheduleItems.find((entry) => entry.kind !== "Assignment" && upcoming(entry));
  const nextShift = demo.volunteer
    ? personalShifts.find((entry) => upcoming(entry) && demo.shifts[entry.id] !== "Declined")
    : undefined;
  return (
    <MemberPage demo={demo} provider={provider} onPreview={preview}
      onSignOut={() => signIn()}
      saveProfile={(profile) => change((s) => ({ ...s, profile }), true)}
      savePreferences={(preferences) => change((s) => ({ ...s, preferences }), true)}
      serving={demo.volunteer ? (nextShift ? <Rows items={[nextShift]} demo={demo} open={setItem} /> : null) : undefined}>
      {nextGathering && <Rows items={[nextGathering]} demo={demo} open={setItem} />}
    </MemberPage>
  );
}

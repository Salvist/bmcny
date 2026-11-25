"use client";

import { useCommunity } from "@/app/components/community-app";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { Rows } from "@/app/components/rows";
import { MemberPage } from "./components/member-profile";

export default function ProfilePage() {
  const { data, demo, provider, scheduleItems, signIn, change, preview, setItem } = useCommunity();
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  const upcoming = scheduleItems.find((entry) =>
    (entry.date > data.today || (entry.date === data.today && (entry.arrival ?? entry.minutes) >= data.minute)) &&
    !(entry.kind === "Assignment" && demo.shifts[entry.id] === "Declined")
  );
  return (
    <MemberPage demo={demo} provider={provider} onPreview={preview}
      onSignOut={() => signIn()}
      saveProfile={(profile) => change((s) => ({ ...s, profile }), true)}
      savePreferences={(preferences) => change((s) => ({ ...s, preferences }), true)}>
      {upcoming && <Rows items={[upcoming]} demo={demo} open={setItem} />}
    </MemberPage>
  );
}

"use client";

import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { MemberPage } from "./components/member-profile";

export default function ProfilePage() {
  const { data, demo, provider, signIn, change, preview } = useCommunity();
  if (!data) return <BulletinLoading />;
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  return (
    <MemberPage demo={demo} provider={provider} onPreview={preview}
      onSignOut={() => signIn()}
      saveProfile={(profile) => change((s) => ({ ...s, profile }), true)}
      savePreferences={(preferences) => change((s) => ({ ...s, preferences }), true)}
    />
  );
}

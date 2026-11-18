import type { Metadata } from "next";
import { Suspense } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DashboardPanelSkeleton, EventsOverviewCard, PrayerOverviewCard } from "@/components/admin_dashboard";
import { loadEventOverview, loadPrayerOverview } from "@/lib/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Home | BMCNY Admin" };

async function EventsPanel({ supabase, now }: { supabase: SupabaseClient; now: Date }) {
  return <EventsOverviewCard overview={await loadEventOverview(supabase, now)} />;
}

async function PrayersPanel({ supabase, now }: { supabase: SupabaseClient; now: Date }) {
  return <PrayerOverviewCard overview={await loadPrayerOverview(supabase, now)} />;
}

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const now = new Date();
  return (
    <div>
      <header className="mb-7 sm:mb-8">
        <h1 className="admin-page-title">Home</h1>
        <p className="admin-page-description">Website activity and recent prayer requests.</p>
      </header>
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <Suspense fallback={<DashboardPanelSkeleton label="events" />}><EventsPanel supabase={supabase} now={now} /></Suspense>
        <Suspense fallback={<DashboardPanelSkeleton label="prayer requests" />}><PrayersPanel supabase={supabase} now={now} /></Suspense>
      </div>
    </div>
  );
}

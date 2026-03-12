import AboutUsSection from "@/components/about_us_section";
import JoinOurCommunitySection from "@/components/join_our_community_section";
import LatestServicesSection from "@/components/latest_services_section";
import MainSection from "@/components/main_section";
import SundayServicesSection from "@/components/sunday_services_section";
import WeeklyServices from "@/components/weekly_services";
import UpcomingServiceBanner from "@/components/upcoming_service_banner";
import EventsSection from "@/components/events_section";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <main
      className="min-h-screen"
      role="main"
      aria-label="Bethany Miracle Center New York homepage"
    >
      <UpcomingServiceBanner />
      <MainSection />
      <EventsSection />
      <AboutUsSection />
      <SundayServicesSection />
      <WeeklyServices />
      <JoinOurCommunitySection />
      <LatestServicesSection />
    </main>
  );
}

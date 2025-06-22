import AboutUsSection from "@/components/about_us_section";
import JoinOurCommunitySection from "@/components/join_our_community_section";
import LatestServicesSection from "@/components/latest_services_section";
import MainSection from "@/components/main_section";
import SundayServicesSection from "@/components/sunday_services_section";
import WeeklyServices from "@/components/weekly_services";
import UpcomingServiceBanner from "@/components/upcoming_service_banner";

export default function Home() {
  return (
    <main className="min-h-screen">
      <UpcomingServiceBanner />
      <MainSection />
      <AboutUsSection />
      <SundayServicesSection />
      <WeeklyServices />
      <JoinOurCommunitySection />
      <LatestServicesSection />
    </main>
  );
}

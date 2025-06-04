import AboutChurchSection from "@/components/about_church_section";
import JoinOurCommunitySection from "@/components/join_our_community_section";
import MainSection from "@/components/main_section";
import SundayServicesSection from "@/components/sunday_services_section";
import WeeklyServices from "@/components/weekly_services";
import {
  ClockIcon,
  MapIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="min-h-screen">
      <MainSection />
      <AboutChurchSection />
      <SundayServicesSection />
      <WeeklyServices />
      <JoinOurCommunitySection />
    </main>
  );
}

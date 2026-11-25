"use client";

import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Rows } from "@/app/components/rows";
import { ServicesNavigation } from "@/app/components/services-navigation";
import { compare } from "@/app/model/bulletin";

export default function ServicesPage() {
  const { data, demo, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;

  return (
    <section>
      <ServicesNavigation active="services" />
      <div className="section-head">
        <h2>Weekly services</h2>
      </div>
      <Rows items={[...data.services].sort(compare)} demo={demo} open={setItem} />
    </section>
  );
}

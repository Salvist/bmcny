"use client";

import Link from "next/link";
import { useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { dateLabel, time } from "@/app/model/bulletin";
import { rosterKey, rosterStatus, type Department } from "@/app/model/scheduling";

export function RosterOverview({ department }: { department: Department }) {
  const { demo, rosters, gatherings } = useCommunity();
  return (
    <div className="rows">
      {gatherings.map((g) => {
        const key = rosterKey(department, g);
        const count = (demo.scheduling.drafts[key] ?? rosters[key])?.duties.length ?? 0;
        const status = rosterStatus(department, g, rosters, demo);
        return (
          <Link className="row" key={g.id} href={"/serving/rosters/edit?" + new URLSearchParams({ department, gathering: g.id })}>
            <span className="day">
              <small>{dateLabel(g.date, { month: "short" })}</small>
              <b>{Number(g.date.slice(-2))}</b>
            </span>
            <span className="row-copy">
              <strong>{g.title}</strong>
              <span className="meta">
                {dateLabel(g.date, { weekday: "short" })} · {time(g.minutes)} ET · {count} {count === 1 ? "assignment" : "assignments"}
              </span>
            </span>
            <span className="tag" data-status={status}>{status}</span>
            <Icon name="chevron" size={15} />
          </Link>
        );
      })}
    </div>
  );
}

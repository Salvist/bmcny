"use client";

import { useCommunity } from "@/app/components/community-app";
import { directory, type Department } from "@/app/model/scheduling";

export function DepartmentMembers({ department }: { department: Department }) {
  const { demo, change } = useCommunity();
  const members = demo.scheduling.members[department] ?? [];
  const available = Object.keys(directory).filter((m) => !members.includes(m));
  return (
    <>
      <h3>Department members ({members.length})</h3>
      <p>{members.map((m) => directory[m]).join(", ") || "No members yet."}</p>
      {available.length > 0 && (
        <form className="actions" onSubmit={(e) => {
          e.preventDefault();
          const member = String(new FormData(e.currentTarget).get("member"));
          change((s) => ({
            ...s,
            scheduling: {
              ...s.scheduling,
              members: {
                ...s.scheduling.members,
                [department]: [...new Set([...(s.scheduling.members[department] ?? []), member])],
              },
            },
          }));
        }}>
          <label>
            Sample directory
            <select name="member">{available.map((m) => <option key={m} value={m}>{directory[m]}</option>)}</select>
          </label>
          <button className="secondary">Add member</button>
        </form>
      )}
    </>
  );
}

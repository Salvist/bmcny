"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { departmentFrom, departments, type Department } from "@/app/model/scheduling";

export const useDepartment = () => departmentFrom(useSearchParams().get("department"));

export function DepartmentPicker({ department }: { department: Department }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label>
      Department
      <select value={department} onChange={(e) => router.replace(pathname + "?department=" + encodeURIComponent(e.target.value))}>
        {departments.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </label>
  );
}

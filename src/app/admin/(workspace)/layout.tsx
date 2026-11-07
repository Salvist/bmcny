import { AdminShell } from "@/components/admin_shell";
import { requireAdmin } from "@/lib/auth";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return <AdminShell email={user?.email ?? null}>{children}</AdminShell>;
}

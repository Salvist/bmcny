import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .ilike("email", user.email)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(data) };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin.user) {
    redirect("/admin/login");
  }

  if (!admin.isAdmin) {
    redirect("/admin/login?error=unauthorized");
  }

  return admin;
}

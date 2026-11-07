"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/admin/actions";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Events", href: "/events", icon: CalendarDaysIcon },
  {
    name: "Prayer Requests",
    href: "/prayer-requests",
    icon: ChatBubbleLeftRightIcon,
  },
];

function cleanPathname(pathname: string) {
  // The admin host rewrites clean URLs to /admin routes on the server.
  if (pathname === "/admin") return "/";
  return pathname.startsWith("/admin/") ? pathname.slice(6) : pathname;
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-sm font-bold text-orange-800"
      >
        B
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-950">
        BMCNY <span className="font-normal text-zinc-500">Admin</span>
      </span>
    </span>
  );
}

interface AdminShellProps {
  children: React.ReactNode;
  email: string | null;
}

export function AdminShell({ children, email }: AdminShellProps) {
  const pathname = cleanPathname(usePathname());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function Navigation({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav aria-label="Admin navigation" className="space-y-1 px-3 py-6">
        {navigation.map(({ name, href, icon: Icon }) => {
          const current =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              onClick={onNavigate}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                current
                  ? "bg-orange-50 text-orange-800"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {name}
            </Link>
          );
        })}
      </nav>
    );
  }

  function Account() {
    return (
      <div className="mt-auto border-t border-zinc-200 p-5">
        <p className="text-xs font-medium text-zinc-500">Signed in as</p>
        <p className="mt-1 break-all text-sm text-zinc-700">{email}</p>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
          >
            <ArrowRightStartOnRectangleIcon
              aria-hidden="true"
              className="size-5 shrink-0"
            />
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <a
        href="#admin-content"
        className="sr-only z-50 rounded-md bg-white p-3 text-sm font-medium text-orange-800 shadow-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col overflow-y-auto border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-zinc-100 px-5">
          <Link href="/" aria-label="BMCNY Admin home" className="flex min-h-11 items-center">
            <Brand />
          </Link>
        </div>
        <Navigation />
        <Account />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
        >
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>
        <Link href="/" aria-label="BMCNY Admin home" className="flex min-h-11 items-center">
          <Brand />
        </Link>
      </header>

      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-zinc-950/35" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="flex h-dvh w-72 max-w-[calc(100vw-3rem)] flex-col overflow-y-auto bg-white shadow-xl">
            <DialogTitle className="sr-only">Admin navigation</DialogTitle>
            <div className="flex min-h-20 items-center justify-between gap-2 border-b border-zinc-100 px-5">
              <Brand />
              <button
                type="button"
                data-autofocus
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
              >
                <XMarkIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
            <Navigation onNavigate={() => setMobileOpen(false)} />
            <Account />
          </DialogPanel>
        </div>
      </Dialog>

      <div className="min-w-0 lg:pl-56">
        <main
          id="admin-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1200px] scroll-mt-16 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:scroll-mt-0 xl:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

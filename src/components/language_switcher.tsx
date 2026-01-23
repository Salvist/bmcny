"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { US, ID } from "country-flag-icons/react/3x2";

type Locale = "en" | "id";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: Locale) => {
    if (isPending) return;
    
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };
  
  // Determine which locale to switch to (opposite of current)
  const targetLocale: Locale = currentLocale === "en" ? "id" : "en";
  const FlagIcon = targetLocale === "en" ? US : ID;
  const languageName = targetLocale === "en" ? "English" : "Bahasa Indonesia";

  return (
    <button
      onClick={() => switchLocale(targetLocale)}
      disabled={isPending}
      className="transition-all rounded hover:opacity-80"
      aria-label={`Switch to ${languageName}`}
      title={languageName}
    >
      <FlagIcon className="w-6 h-4" />
    </button>
  );
}

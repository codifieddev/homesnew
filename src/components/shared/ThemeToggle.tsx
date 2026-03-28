"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "@/components/shared/LocaleProvider";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
      className={cn(
        "secondary-cta inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/70",
        className
      )}
      aria-label={mounted
        ? isDark
          ? t("themeToggle.light")
          : t("themeToggle.dark")
        : t("themeToggle.toggle")}
      title={mounted
        ? isDark
          ? t("themeToggle.light")
          : t("themeToggle.dark")
        : t("themeToggle.toggle")}
    >
      {!mounted ? (
        <SunMedium className="h-4 w-4" />
      ) : isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

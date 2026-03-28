"use client";

import { Check, Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/components/shared/LocaleProvider";
import { replaceLocaleInPathname } from "@/lib/i18n/utils";

export function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const { locale, registry, runtimeSettings } = useLocaleContext();

  const orderedLocales = runtimeSettings.localeOrder.filter((candidate) =>
    runtimeSettings.enabledLocales.includes(candidate)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "secondary-cta inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
          aria-label={registry[locale].label}
          title={registry[locale].label}
        >
          <Languages className="h-4 w-4 text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 border-border bg-card/95 text-foreground backdrop-blur-xl"
      >
        {orderedLocales.map((candidate) => {
          const isActive = candidate === locale;

          return (
            <DropdownMenuItem
              key={candidate}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm"
              onSelect={() => {
                const nextPath = replaceLocaleInPathname(pathname, candidate);
                document.cookie = `homes-locale=${candidate}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
                window.location.assign(nextPath);
              }}
            >
              <div className="flex flex-col">
                <span>{registry[candidate].nativeLabel}</span>
                <span className="text-xs text-muted-foreground">
                  {registry[candidate].label}
                </span>
              </div>
              {isActive ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

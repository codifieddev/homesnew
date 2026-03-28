"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2, ExternalLink, Eye, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updatePropertySitePublishStatus } from "@/lib/db/actions/property-site.actions";
import type { IPropertySite } from "@/types";

interface PropertySiteWorkflowActionsProps {
  site: IPropertySite;
  canPublish: boolean;
  compact?: boolean;
}

export function PropertySiteWorkflowActions({
  site,
  canPublish,
  compact = false,
}: PropertySiteWorkflowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const baseButtonClass = compact
    ? "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors"
    : "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors";

  const updateStatus = (publishStatus: IPropertySite["publishStatus"]) => {
    startTransition(async () => {
      const response = await updatePropertySitePublishStatus(site._id!, publishStatus);
      if (!response.success) {
        toast.error(response.error ?? "Failed to update microsite status");
        return;
      }

      toast.success(response.message ?? "Microsite status updated");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/sites/preview/${site._id}`}
        className={`${baseButtonClass} border-border text-muted-foreground hover:bg-accent hover:text-foreground`}
      >
        <Eye className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> Preview
      </Link>
      {site.publishStatus === "published" && (
        <Link
          href={`/sites/${site.siteSlug}`}
          target="_blank"
          className={`${baseButtonClass} border-border text-muted-foreground hover:bg-accent hover:text-foreground`}
        >
          <ExternalLink className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> Live
        </Link>
      )}
      <Link
        href={`/admin/property-sites/${site._id}/edit`}
        className={`${baseButtonClass} border-primary/20 bg-primary/10 text-primary hover:bg-primary/15`}
      >
        <Pencil className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> Edit
      </Link>
      {canPublish ? (
        <>
          {site.publishStatus !== "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => updateStatus("published")}
              className={`${baseButtonClass} border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/15 disabled:opacity-60`}
            >
              {isPending ? (
                <Loader2 className={compact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"} />
              ) : (
                <CheckCircle2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              )}
              Publish
            </button>
          )}
          {site.publishStatus === "published" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => updateStatus("draft")}
              className={`${baseButtonClass} border-border text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60`}
            >
              Move to Draft
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => updateStatus("archived")}
              className={`${baseButtonClass} border-border text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60`}
            >
              Archive
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            updateStatus(site.publishStatus === "in_review" ? "draft" : "in_review")
          }
          className={`${baseButtonClass} border-border text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60`}
        >
          {isPending ? (
            <Loader2 className={compact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"} />
          ) : null}
          {site.publishStatus === "in_review" ? "Return to Draft" : "Submit Review"}
        </button>
      )}
    </div>
  );
}

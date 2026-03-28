"use client";

import { useEffect, useState, useTransition } from "react";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import {
  ArrowUpDown,
  FileText,
  ImageIcon,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePropertyMedia,
  reorderPropertyMedia,
  setPropertyCoverImage,
  uploadPropertyMedia,
  updatePropertyMediaCaption,
} from "@/lib/db/actions/property-media.actions";
import { cn } from "@/lib/utils";
import type { IMediaAsset } from "@/types";

const MEDIA_TYPES: Array<{ value: IMediaAsset["type"]; label: string }> = [
  { value: "image", label: "Image" },
  { value: "floorplan", label: "Floor Plan" },
  { value: "brochure", label: "Brochure" },
  { value: "video", label: "Video" },
];

function isPreviewableImage(asset: IMediaAsset) {
  return ["image", "floorplan"].includes(asset.type) && !asset.url.toLowerCase().endsWith(".pdf");
}

function sortAssets(assets: IMediaAsset[]) {
  return [...assets].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function moveAsset(assets: IMediaAsset[], sourceUrl: string, targetUrl: string) {
  const nextAssets = [...assets];
  const sourceIndex = nextAssets.findIndex((asset) => asset.url === sourceUrl);
  const targetIndex = nextAssets.findIndex((asset) => asset.url === targetUrl);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return nextAssets;
  }

  const [movedAsset] = nextAssets.splice(sourceIndex, 1);
  nextAssets.splice(targetIndex, 0, movedAsset);
  return nextAssets.map((asset, index) => ({ ...asset, order: index }));
}

export function MediaGallery({
  propertyId,
  initialAssets,
  onChange,
}: {
  propertyId?: string;
  initialAssets: IMediaAsset[];
  onChange: (assets: IMediaAsset[]) => void;
}) {
  const [assets, setAssets] = useState(() => sortAssets(initialAssets));
  const [isPending, startTransition] = useTransition();
  const [assetType, setAssetType] = useState<IMediaAsset["type"]>("image");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [draggedUrl, setDraggedUrl] = useState<string | null>(null);

  useEffect(() => {
    setAssets(sortAssets(initialAssets));
  }, [initialAssets]);

  const syncAssets = (nextAssets: IMediaAsset[]) => {
    const sortedAssets = sortAssets(nextAssets);
    setAssets(sortedAssets);
    onChange(sortedAssets);
  };

  const handleUpload = () => {
    if (!propertyId) {
      toast.error("Create the property first to enable uploads");
      return;
    }

    if (!selectedFile) {
      toast.error("Choose a file to upload");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("type", assetType);
      if (caption.trim()) {
        formData.set("caption", caption.trim());
      }

      const res = await uploadPropertyMedia(propertyId, formData);

      if (res.success && res.data) {
        syncAssets(res.data);
        setCaption("");
        setSelectedFile(null);
        setInputKey((current) => current + 1);
        toast.success(res.message ?? "Media uploaded");
        return;
      }

      toast.error(res.error ?? "Upload failed");
    });
  };

  const handleDelete = (assetUrl: string) => {
    if (!propertyId) return;

    startTransition(async () => {
      const res = await deletePropertyMedia(propertyId, assetUrl);

      if (res.success && res.data) {
        syncAssets(res.data);
        toast.success(res.message ?? "Media deleted");
        return;
      }

      toast.error(res.error ?? "Delete failed");
    });
  };

  const handleSetCover = (assetUrl: string) => {
    if (!propertyId) return;

    startTransition(async () => {
      const res = await setPropertyCoverImage(propertyId, assetUrl);

      if (res.success && res.data) {
        syncAssets(res.data);
        toast.success(res.message ?? "Cover updated");
        return;
      }

      toast.error(res.error ?? "Cover update failed");
    });
  };

  const handleUpdateCaption = (assetUrl: string, newCaption: string) => {
    if (!propertyId) return;

    startTransition(async () => {
      const res = await updatePropertyMediaCaption(propertyId, assetUrl, newCaption);

      if (res.success && res.data) {
        syncAssets(res.data);
        toast.success("Caption saved");
        return;
      }

      toast.error(res.error ?? "Failed to save caption");
    });
  };

  const handleDrop = (targetUrl: string) => {
    if (!propertyId || !draggedUrl || draggedUrl === targetUrl) {
      setDraggedUrl(null);
      return;
    }

    const nextAssets = moveAsset(assets, draggedUrl, targetUrl);
    syncAssets(nextAssets);
    setDraggedUrl(null);

    startTransition(async () => {
      const res = await reorderPropertyMedia(
        propertyId,
        nextAssets.map((asset) => asset.url)
      );

      if (res.success && res.data) {
        syncAssets(res.data);
        return;
      }

      toast.error(res.error ?? "Could not save the new order");
      setAssets(sortAssets(initialAssets));
      onChange(sortAssets(initialAssets));
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Upload File
            </label>
            <input
              key={inputKey}
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            />
          </div>
          <div className="sm:w-40">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Media Type
            </label>
            <select
              value={assetType}
              onChange={(event) => setAssetType(event.target.value as IMediaAsset["type"])}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Caption
            </label>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Optional caption"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!propertyId || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
        </div>
        {!propertyId && (
          <p className="mt-3 text-xs text-muted-foreground">
            Save the property once, then come back here to upload and manage the gallery.
          </p>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/70 p-8 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No media uploaded yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload images, floor plans, brochures, or short video clips for this listing.
          </p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {MEDIA_TYPES.map((typeDef) => {
            const groupAssets = assets.filter((a) => a.type === typeDef.value);
            if (groupAssets.length === 0) return null;

            return (
              <div key={typeDef.value}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  {typeDef.label}s
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-[10px]">
                    {groupAssets.length}
                  </span>
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {groupAssets.map((asset) => (
                    <div
                      key={asset.url}
                      draggable={!!propertyId}
                      onDragStart={() => setDraggedUrl(asset.url)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(asset.url)}
                      className={cn(
                        "overflow-hidden rounded-xl border border-border bg-card transition-colors",
                        draggedUrl === asset.url && "opacity-70 scale-95 border-primary/50"
                      )}
                    >
                      <div className="relative h-44 bg-accent/20">
                        {isPreviewableImage(asset) ? (
                          <Image
                            src={asset.url}
                            alt={asset.caption ?? asset.type}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground bg-accent/30">
                            <FileText className="h-10 w-10 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          <span className="rounded-md bg-background/95 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground shadow-sm backdrop-blur-md">
                            {asset.type.replace(/_/g, " ")}
                          </span>
                          {asset.isCover && (
                            <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-primary-foreground shadow-sm">
                              Cover Image
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <input
                              defaultValue={asset.caption || ""}
                              placeholder="Add a caption..."
                              onBlur={(e) => {
                                if (e.target.value.trim() !== (asset.caption || "")) {
                                  handleUpdateCaption(asset.url, e.target.value);
                                }
                              }}
                              className="w-full truncate text-sm font-medium text-foreground bg-transparent border-none p-0 outline-none focus:ring-0 placeholder:text-muted-foreground/60 transition-colors focus:text-primary"
                              disabled={isPending}
                            />
                            <p className="mt-1 text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                              {asset.url.split("/").pop()}
                            </p>
                          </div>
                          <div className="cursor-grab active:cursor-grabbing p-1 -mr-1 text-muted-foreground/50 hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Drag to reorder">
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                          {asset.type === "image" && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(asset.url)}
                              disabled={isPending || asset.isCover}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-accent hover:text-primary disabled:opacity-50"
                            >
                              <Star className={cn("h-3.5 w-3.5", asset.isCover && "fill-primary text-primary")} />
                              {asset.isCover ? "Cover" : "Set Cover"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(asset.url)}
                            disabled={isPending}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all disabled:opacity-50",
                              asset.type === "image" 
                                ? "border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10" 
                                : "w-full border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10"
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

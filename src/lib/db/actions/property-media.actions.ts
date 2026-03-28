"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { withRole } from "@/lib/auth/utils";
import { connectDB } from "@/lib/db/connection";
import {
  requireObjectId,
  serialize,
} from "@/lib/db/actions/helpers";
import Property from "@/lib/db/models/Property";
import type { ApiResponse, IMediaAsset } from "@/types";

const LOCAL_UPLOAD_PREFIX = "/uploads/properties/";
const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;
const UPLOADABLE_MEDIA_TYPES: IMediaAsset["type"][] = [
  "image",
  "floorplan",
  "brochure",
  "video",
];

function sanitizeFileName(name: string) {
  const extension = path.extname(name).toLowerCase();
  const basename = path.basename(name, extension);
  const safeBase = basename
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60) || "media";

  return `${safeBase}${extension}`;
}

function normalizeMediaAssets(assets: IMediaAsset[]) {
  const sorted = [...assets].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  const requestedCover = sorted.find((asset) => asset.type === "image" && asset.isCover)?.url;
  const fallbackCover = sorted.find((asset) => asset.type === "image")?.url;
  const coverUrl = requestedCover ?? fallbackCover;

  return sorted.map((asset, index) => ({
    ...asset,
    order: index,
    isCover: asset.type === "image" ? asset.url === coverUrl : false,
  }));
}

function revalidatePropertyPaths(propertyId: string, slug: string) {
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/projects");
  revalidatePath("/");
}

function getPropertyUploadDir(slug: string) {
  return path.join(process.cwd(), "public", "uploads", "properties", slug);
}

function getLocalAssetPath(assetUrl: string) {
  return path.join(process.cwd(), "public", assetUrl.replace(/^\//, ""));
}

async function getPropertyForMediaMutation(propertyId: string) {
  await withRole(["super_admin", "admin"]);
  await connectDB();

  const propertyObjectId = requireObjectId(propertyId, "property media: property id");
  const property = await Property.findById(propertyObjectId);

  if (!property) {
    throw new Error("Property not found");
  }

  return property;
}

export async function uploadPropertyMedia(
  propertyId: string,
  formData: FormData
): Promise<ApiResponse<IMediaAsset[]>> {
  try {
    const property = await getPropertyForMediaMutation(propertyId);

    const rawFile = formData.get("file");
    const rawType = formData.get("type");
    const rawCaption = formData.get("caption");

    if (!(rawFile instanceof File) || rawFile.size === 0) {
      return { success: false, error: "Choose a file to upload" };
    }

    if (rawFile.size > MAX_UPLOAD_SIZE) {
      return { success: false, error: "File must be 4 MB or smaller" };
    }

    const assetType = UPLOADABLE_MEDIA_TYPES.includes(rawType as IMediaAsset["type"])
      ? (rawType as IMediaAsset["type"])
      : "image";
    const caption = typeof rawCaption === "string" && rawCaption.trim()
      ? rawCaption.trim()
      : undefined;

    const uploadDir = getPropertyUploadDir(property.slug);
    const fileName = `${Date.now()}-${sanitizeFileName(rawFile.name)}`;
    const filePath = path.join(uploadDir, fileName);
    const fileBuffer = Buffer.from(await rawFile.arrayBuffer());

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, fileBuffer);

    const existingAssets = serialize<IMediaAsset[]>(property.mediaAssets ?? []);
    const newAsset: IMediaAsset = {
      url: `${LOCAL_UPLOAD_PREFIX}${property.slug}/${fileName}`,
      type: assetType,
      caption,
      isCover: assetType === "image" && !existingAssets.some((asset) => asset.type === "image"),
      order: existingAssets.length,
    };

    const mediaAssets = normalizeMediaAssets([...existingAssets, newAsset]);
    property.mediaAssets = mediaAssets;
    await property.save();

    revalidatePropertyPaths(property.id, property.slug);

    return {
      success: true,
      data: serialize<IMediaAsset[]>(property.mediaAssets),
      message: "Media uploaded",
    };
  } catch (error) {
    console.error("[uploadPropertyMedia]", { propertyId, error });
    return { success: false, error: "Failed to upload media" };
  }
}

export async function setPropertyCoverImage(
  propertyId: string,
  assetUrl: string
): Promise<ApiResponse<IMediaAsset[]>> {
  try {
    const property = await getPropertyForMediaMutation(propertyId);
    const existingAssets = serialize<IMediaAsset[]>(property.mediaAssets ?? []);
    const targetAsset = existingAssets.find((asset) => asset.url === assetUrl);

    if (!targetAsset) {
      return { success: false, error: "Media item not found" };
    }

    if (targetAsset.type !== "image") {
      return { success: false, error: "Only images can be used as the cover" };
    }

    property.mediaAssets = normalizeMediaAssets(
      existingAssets.map((asset) => ({
        ...asset,
        isCover: asset.url === assetUrl,
      }))
    );
    await property.save();

    revalidatePropertyPaths(property.id, property.slug);

    return {
      success: true,
      data: serialize<IMediaAsset[]>(property.mediaAssets),
      message: "Cover image updated",
    };
  } catch (error) {
    console.error("[setPropertyCoverImage]", { propertyId, assetUrl, error });
    return { success: false, error: "Failed to update the cover image" };
  }
}

export async function updatePropertyMediaCaption(
  propertyId: string,
  assetUrl: string,
  caption: string
): Promise<ApiResponse<IMediaAsset[]>> {
  try {
    const property = await getPropertyForMediaMutation(propertyId);
    const existingAssets = serialize<IMediaAsset[]>(property.mediaAssets ?? []);
    const targetAssetIndex = existingAssets.findIndex((asset) => asset.url === assetUrl);

    if (targetAssetIndex === -1) {
      return { success: false, error: "Media item not found" };
    }

    const nextAssets = [...existingAssets];
    nextAssets[targetAssetIndex] = {
      ...nextAssets[targetAssetIndex],
      caption: caption.trim() || undefined,
    };

    property.mediaAssets = normalizeMediaAssets(nextAssets);
    await property.save();

    revalidatePropertyPaths(property.id, property.slug);

    return {
      success: true,
      data: serialize<IMediaAsset[]>(property.mediaAssets),
      message: "Media caption updated",
    };
  } catch (error) {
    console.error("[updatePropertyMediaCaption]", { propertyId, assetUrl, error });
    return { success: false, error: "Failed to update caption" };
  }
}

export async function reorderPropertyMedia(
  propertyId: string,
  orderedUrls: string[]
): Promise<ApiResponse<IMediaAsset[]>> {
  try {
    const property = await getPropertyForMediaMutation(propertyId);
    const existingAssets = serialize<IMediaAsset[]>(property.mediaAssets ?? []);

    if (existingAssets.length === 0) {
      return { success: true, data: [], message: "No media to reorder" };
    }

    const mediaByUrl = new Map(existingAssets.map((asset) => [asset.url, asset]));
    const nextAssets: IMediaAsset[] = [];

    orderedUrls.forEach((url) => {
      const asset = mediaByUrl.get(url);
      if (asset) {
        nextAssets.push(asset);
        mediaByUrl.delete(url);
      }
    });

    mediaByUrl.forEach((asset) => nextAssets.push(asset));

    property.mediaAssets = normalizeMediaAssets(nextAssets);
    await property.save();

    revalidatePropertyPaths(property.id, property.slug);

    return {
      success: true,
      data: serialize<IMediaAsset[]>(property.mediaAssets),
      message: "Media order updated",
    };
  } catch (error) {
    console.error("[reorderPropertyMedia]", { propertyId, orderedUrls, error });
    return { success: false, error: "Failed to reorder media" };
  }
}

export async function deletePropertyMedia(
  propertyId: string,
  assetUrl: string
): Promise<ApiResponse<IMediaAsset[]>> {
  try {
    const property = await getPropertyForMediaMutation(propertyId);
    const existingAssets = serialize<IMediaAsset[]>(property.mediaAssets ?? []);
    const assetToDelete = existingAssets.find((asset) => asset.url === assetUrl);

    if (!assetToDelete) {
      return { success: false, error: "Media item not found" };
    }

    property.mediaAssets = normalizeMediaAssets(
      existingAssets.filter((asset) => asset.url !== assetUrl)
    );
    await property.save();

    if (assetToDelete.url.startsWith(LOCAL_UPLOAD_PREFIX)) {
      try {
        await unlink(getLocalAssetPath(assetToDelete.url));
      } catch (error) {
        console.error("[deletePropertyMedia:unlink]", {
          propertyId,
          assetUrl,
          error,
        });
      }
    }

    revalidatePropertyPaths(property.id, property.slug);

    return {
      success: true,
      data: serialize<IMediaAsset[]>(property.mediaAssets),
      message: "Media deleted",
    };
  } catch (error) {
    console.error("[deletePropertyMedia]", { propertyId, assetUrl, error });
    return { success: false, error: "Failed to delete media" };
  }
}

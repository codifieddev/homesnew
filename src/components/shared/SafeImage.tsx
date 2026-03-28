"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
  className?: string;
}

export function SafeImage({
  src,
  fallbackSrc = "/images/placeholder.svg",
  alt,
  className,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  const displaySrc =
    !normalizedSrc || failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;
  const isRemoteSrc = /^https?:\/\//i.test(displaySrc);

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt || "Image"}
      className={className}
      unoptimized={isRemoteSrc || props.unoptimized}
      onError={() => {
        if (displaySrc !== fallbackSrc) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}

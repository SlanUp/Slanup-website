"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://d2oulqfcyna7a4.cloudfront.net";

// Extract S3 key from full URL or return as-is
function toS3Key(value: string): string {
  const match = value.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : value;
}

interface S3ImageProps {
  fileKey: string | undefined | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
}

// Fetches a signed URL from the backend and displays the image
export default function S3Image({ fileKey, alt = "", className = "", width, height, fallback }: S3ImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!fileKey) return;

    const key = toS3Key(fileKey);
    const url = `${API_BASE}/api/upload/get-file-url?fileKey=${encodeURIComponent(key)}`;

    // Try fetching without auth first (get-file-url might not require it when Redis is down)
    const token = typeof window !== "undefined" ? localStorage.getItem("slanup_token") : null;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setSrc(data.url);
      })
      .catch(() => {
        // Fallback: try direct S3 URL (might work for public buckets)
        if (fileKey.startsWith("http")) setSrc(fileKey);
      });
  }, [fileKey]);

  if (!fileKey) return fallback || null;
  if (!src) return fallback || <div className={className} style={{ width, height }} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

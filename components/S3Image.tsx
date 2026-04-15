"use client";

// Images served via CloudFront CDN for edge caching
// Falls back to direct S3 if env var not set
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://d1dtto9m3muhz5.cloudfront.net";

// Extract S3 key from full URL or return as-is
function toS3Key(value: string): string {
  const match = value.match(/amazonaws\.com\/(.+)$/) || value.match(/cloudfront\.net\/(.+)$/);
  return match ? match[1] : value;
}

// Build a CDN URL from a file key
export function getS3Url(fileKey: string): string {
  const key = toS3Key(fileKey);
  return `${CDN_BASE}/${key}`;
}

interface S3ImageProps {
  fileKey: string | undefined | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
}

export default function S3Image({ fileKey, alt = "", className = "", width, height, fallback }: S3ImageProps) {
  if (!fileKey) return fallback || null;

  const src = getS3Url(fileKey);

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

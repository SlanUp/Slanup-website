"use client";

// Direct public S3 URL — no signing needed
// Dev: slanup-dev-content.s3.us-east-1.amazonaws.com
// Prod: slanup-user-uploaded-content.s3.eu-north-1.amazonaws.com
const S3_BASE = process.env.NEXT_PUBLIC_S3_BASE_URL || "https://slanup-user-uploaded-content.s3.eu-north-1.amazonaws.com";

// Extract S3 key from full URL or return as-is
function toS3Key(value: string): string {
  const match = value.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : value;
}

// Build a public S3 URL from a file key
export function getS3Url(fileKey: string): string {
  const key = toS3Key(fileKey);
  return `${S3_BASE}/${key}`;
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

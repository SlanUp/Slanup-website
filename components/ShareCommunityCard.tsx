"use client";

import { useState, useEffect, useCallback } from "react";
import { getS3Url } from "./S3Image";

export interface ShareCommunityCardProps {
  community: {
    _id: string;
    name: string;
    description?: string;
    coverImage?: string;
    city: string;
    planCount: number;
    totalParticipants: number;
    followerCount: number;
    avgRating?: string | null;
    admin?: { name?: string; image?: string };
    moderators?: { name?: string; image?: string }[];
  };
  onClose: () => void;
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImg(src: string, ms = 6000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    img.onload = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => { clearTimeout(t); reject(new Error("load error")); };
    img.src = src;
  });
}

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const ir = img.width / img.height;
  const br = dw / dh;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (ir > br) { sw = img.height * br; sx = (img.width - sw) / 2; }
  else { sh = img.width / br; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

type CommunityData = ShareCommunityCardProps["community"];

async function renderCommunityCard(community: CommunityData): Promise<Blob> {
  const S = 2.4;
  const CW = Math.round(360 * S);
  const IH = Math.round(200 * S);
  const PX = Math.round(22 * S);

  const SW = 1080, SH = 1920;
  const c = document.createElement("canvas");
  c.width = SW; c.height = SH;
  const ctx = c.getContext("2d")!;

  // Story background
  const storyBg = ctx.createLinearGradient(0, 0, 0, SH);
  storyBg.addColorStop(0, "#2a2f20");
  storyBg.addColorStop(0.5, "#1e2318");
  storyBg.addColorStop(1, "#161a12");
  ctx.fillStyle = storyBg;
  ctx.fillRect(0, 0, SW, SH);

  // Load cover image
  const coverImg = community.coverImage
    ? await loadImg(getS3Url(community.coverImage) + "?v=c").catch(() => null)
    : null;

  // Layout
  const nameY = IH + 24 * S;
  ctx.font = `800 ${22 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  const nameLines = wrapLines(ctx, community.name, CW - PX * 2);
  const nameH = nameLines.length * 28 * S;

  const cityY = nameY + nameH + 8 * S;
  const statsY = cityY + 22 * S + 16 * S;
  const descY = statsY + 36 * S + 16 * S;

  ctx.font = `400 ${13 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  const descLines = community.description
    ? wrapLines(ctx, community.description, CW - PX * 2).slice(0, 3)
    : [];
  const descH = descLines.length * 20 * S;

  const brandY = descY + descH + 24 * S;
  const CH = Math.round(brandY + 20 * S + 22 * S);

  const cardX = (SW - CW) / 2;
  const cardY = Math.round((SH - CH) / 2 - 40);

  // Draw card
  ctx.save();
  ctx.translate(cardX, cardY);

  rrect(ctx, 0, 0, CW, CH, 24 * S);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, 0, CW * 0.5, CH);
  bg.addColorStop(0, "#636B50");
  bg.addColorStop(0.4, "#4a5239");
  bg.addColorStop(1, "#2d3220");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // Cover image
  if (coverImg) {
    coverDraw(ctx, coverImg, 0, 0, CW, IH);
  } else {
    const grad = ctx.createLinearGradient(0, 0, CW, IH);
    grad.addColorStop(0, "#7a8460");
    grad.addColorStop(1, "#4a5239");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, IH);
    ctx.font = `400 ${40 * S}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillText("🏘️", CW / 2, IH / 2);
  }

  // Gradient overlay on cover
  const ov = ctx.createLinearGradient(0, IH - 80 * S, 0, IH);
  ov.addColorStop(0, "rgba(0,0,0,0)");
  ov.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = ov;
  ctx.fillRect(0, IH - 80 * S, CW, 80 * S);

  // Community name
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `800 ${22 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "#fff";
  nameLines.forEach((ln, i) => ctx.fillText(ln, PX, nameY + i * 28 * S));

  // City + rating
  ctx.font = `500 ${14 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  let cityText = `📍 ${community.city}`;
  if (community.avgRating) cityText += `  ⭐ ${community.avgRating}`;
  ctx.fillText(cityText, PX, cityY);

  // Stats pills
  const pillR = 12 * S, pillH = 36 * S, pillPX = 14 * S;
  let px = PX;
  ctx.font = `600 ${12 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.textBaseline = "middle";

  const stats = [
    `📋 ${community.planCount} plan${community.planCount !== 1 ? 's' : ''}`,
    `👥 ${community.totalParticipants} people`,
    `🔔 ${community.followerCount} followers`,
  ];
  for (const stat of stats) {
    const tw = ctx.measureText(stat).width + pillPX * 2;
    if (px + tw > CW - PX) { px = PX; } // wrap to next line if needed
    rrect(ctx, px, statsY, tw, pillH, pillR);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(stat, px + pillPX, statsY + pillH / 2);
    px += tw + 8 * S;
  }

  // Description
  if (descLines.length > 0) {
    ctx.textBaseline = "top";
    ctx.font = `400 ${13 * S}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    descLines.forEach((ln, i) => ctx.fillText(ln, PX, descY + i * 20 * S));
  }

  // Brand
  ctx.textBaseline = "top";
  ctx.font = `700 ${15 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.fillText("slanup'", PX, brandY);
  const slW = ctx.measureText("slanup'").width;
  ctx.font = `600 ${7 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillText("beta", PX + slW + 2 * S, brandY + 3 * S);
  ctx.textAlign = "right";
  ctx.font = `400 ${10 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("slanup.com", CW - PX, brandY + 4 * S);

  ctx.restore();

  // CTA below card
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `500 ${12 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("Join this community on slanup.com", SW / 2, cardY + CH + 25 * S);

  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

export default function ShareCommunityCard({ community, onClose }: ShareCommunityCardProps) {
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coverUrl = community.coverImage ? getS3Url(community.coverImage) : null;

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await renderCommunityCard(community);
      setShareFile(
        new File([blob], `slanup-community-${community.name.replace(/\s+/g, "-").toLowerCase()}.png`, { type: "image/png" })
      );
    } catch (err) {
      console.error("[ShareCommunityCard] render failed:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [community]);

  useEffect(() => { generate(); }, [generate]);

  const handleShare = async () => {
    if (!shareFile) return;
    try {
      if (navigator.share && navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({
          title: community.name,
          text: `Join ${community.name} on Slanup!`,
          url: `https://www.slanup.com/app/community/${community._id}`,
          files: [shareFile],
        });
      } else {
        const url = URL.createObjectURL(shareFile);
        const a = document.createElement("a");
        a.href = url; a.download = shareFile.name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") setError("Share failed");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.slanup.com/app/community/${community._id}`);
      alert("Link copied!");
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>

        {/* Visual preview */}
        <div style={{ width: 360, padding: 0 }}>
          <div style={{ width: 360, borderRadius: 24, overflow: "hidden", background: "linear-gradient(145deg, #636B50 0%, #4a5239 40%, #2d3220 100%)", fontFamily: "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <div style={{ width: "100%", height: 200, position: "relative", overflow: "hidden" }}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #7a8460, #4a5239)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40, opacity: 0.2 }}>🏘️</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }} />
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{community.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6, fontWeight: 500 }}>
                📍 {community.city}
                {community.avgRating && <span>  ⭐ {community.avgRating}</span>}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  📋 {community.planCount} plan{community.planCount !== 1 ? 's' : ''}
                </div>
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  👥 {community.totalParticipants} people
                </div>
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  🔔 {community.followerCount} followers
                </div>
              </div>
              {community.description && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 14, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {community.description}
                </div>
              )}
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>slanup&apos;<span style={{ fontSize: 7, fontWeight: 600, marginLeft: 1, position: "relative" as const, top: -4 }}>beta</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>slanup.com</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-200 text-xs px-4 py-2 rounded-lg max-w-[360px] w-full text-center">
            {error}
            <button onClick={generate} className="underline ml-2">Retry</button>
          </div>
        )}

        <div className="flex gap-3 w-full max-w-[360px]">
          <button onClick={handleShare} disabled={generating || !shareFile} className="flex-1 bg-white text-neutral-800 font-semibold py-3 rounded-xl text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50">
            {generating ? "Generating..." : "📤 Share to Story"}
          </button>
          <button onClick={handleCopyLink} className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl text-sm hover:bg-white/30 transition-colors">
            🔗 Copy Link
          </button>
        </div>
        <button onClick={onClose} className="text-white/60 text-sm hover:text-white transition-colors mt-1">Close</button>
      </div>
    </div>
  );
}

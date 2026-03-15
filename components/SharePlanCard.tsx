"use client";

import { useState, useEffect, useCallback } from "react";
import { getS3Url } from "./S3Image";

interface SharePlanCardProps {
  plan: {
    id: string;
    name: string;
    desc?: string;
    pic_id?: string;
    start: string;
    end: string;
    venue_string?: string;
    city?: string;
    tags?: string[];
    max_people: number;
    participants: { _id: string; name: string; image?: string }[];
    creator_id: { _id: string; name: string; image?: string };
  };
  onClose: () => void;
}

// -- Canvas helpers --

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

function coverDraw(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
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

function clampLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const all = wrapLines(ctx, text, maxW);
  if (all.length <= maxLines) return all;
  const clamped = all.slice(0, maxLines);
  let last = clamped[maxLines - 1];
  while (ctx.measureText(last + "…").width > maxW && last.length > 1) last = last.slice(0, -1).trimEnd();
  clamped[maxLines - 1] = last + "…";
  return clamped;
}

// -- Native Canvas renderer: story-sized (1080x1920) with solid bg --

type PlanData = SharePlanCardProps["plan"];

async function renderCard(plan: PlanData): Promise<Blob> {
  const S = 2.4;
  const CW = Math.round(360 * S);
  const IH = Math.round(180 * S);
  const PX = Math.round(22 * S);

  const SW = 1080, SH = 1920;
  const c = document.createElement("canvas");
  c.width = SW; c.height = SH;
  const ctx = c.getContext("2d")!;

  // Solid story background (no transparency = no black corners on JPG)
  const storyBg = ctx.createLinearGradient(0, 0, 0, SH);
  storyBg.addColorStop(0, "#2a2f20");
  storyBg.addColorStop(0.5, "#1e2318");
  storyBg.addColorStop(1, "#161a12");
  ctx.fillStyle = storyBg;
  ctx.fillRect(0, 0, SW, SH);

  // Load all images in parallel (cache-bust to avoid CORS cache conflict)
  const imgLoads: Promise<HTMLImageElement | null>[] = [];
  imgLoads.push(
    plan.pic_id ? loadImg(getS3Url(plan.pic_id) + "?v=c").catch(() => null) : Promise.resolve(null)
  );
  plan.participants.slice(0, 3).forEach((p) => {
    imgLoads.push(
      p.image ? loadImg(getS3Url(p.image) + "?v=c", 4000).catch(() => null) : Promise.resolve(null)
    );
  });
  const [planImg, ...partImgs] = await Promise.all(imgLoads);

  // --- Compute layout to match preview ---
  // Preview: padding "18px 22px 22px", flex row marginTop: -36, title paddingTop: 40
  const bW = 56 * S, bH = 56 * S;
  const bX = PX;
  const bY = IH - 18 * S; // image + 18px padding - 36px marginTop

  const tX = bX + bW + 14 * S;
  const tMaxW = CW - tX - PX;
  ctx.font = `700 ${17 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  const titleLines = clampLines(ctx, plan.name, tMaxW, 1);
  const tY = bY + 28 * S; // paddingTop: 28 from section top
  const titleTextBottom = tY + titleLines.length * 22 * S;
  const venueH = plan.venue_string ? 4 * S + 16 * S : 0;
  const sectionBottom = Math.max(bY + bH, titleTextBottom + venueH);

  const pillY = sectionBottom + 14 * S;
  const pillH = 30 * S;
  const sepY = pillY + pillH + 14 * S;
  const partY = sepY + 14 * S;
  const cr = 13 * S;
  const brandY = partY + cr * 2 + 14 * S;
  const CH = Math.round(brandY + 20 * S + 22 * S);

  const cardX = (SW - CW) / 2;
  const cardY = Math.round((SH - CH) / 2 - 40);

  // --- Draw card ---
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

  if (planImg) {
    coverDraw(ctx, planImg, 0, 0, CW, IH);
  }

  const ov = ctx.createLinearGradient(0, IH - 80 * S, 0, IH);
  ov.addColorStop(0, "rgba(0,0,0,0)");
  ov.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = ov;
  ctx.fillRect(0, IH - 80 * S, CW, 80 * S);

  const startDate = new Date(plan.start);
  const endDate = new Date(plan.end);
  const day = startDate.getDate().toString();
  const month = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
  const timeStr = startDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTime = endDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const spotsLeft = plan.max_people - plan.participants.length;

  // Date box
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 14 * S;
  ctx.shadowOffsetY = 4 * S;
  rrect(ctx, bX, bY, bW, bH, 14 * S);
  ctx.fillStyle = "#fff"; ctx.fill();
  ctx.restore();

  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `800 ${22 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "#262626";
  ctx.fillText(day, bX + bW / 2, bY + 22 * S);
  ctx.font = `700 ${11 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "#ef4444";
  ctx.fillText(month, bX + bW / 2, bY + 42 * S);

  // Title
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.font = `700 ${17 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "#fff";
  titleLines.forEach((ln: string, i: number) => ctx.fillText(ln, tX, tY + i * 22 * S));

  if (plan.venue_string) {
    const vY = titleTextBottom + 4 * S;
    ctx.font = `400 ${12 * S}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    let vt = plan.venue_string;
    while (ctx.measureText(vt).width > tMaxW - 20 * S && vt.length > 5) vt = vt.slice(0, -4) + "…";
    ctx.fillText("📍 " + vt, tX, vY);
  }

  // Time/city pills
  const pillR = 10 * S, pillPX = 12 * S;
  let px = PX;
  ctx.font = `500 ${12 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.textBaseline = "middle";

  const timeTxt = `🕐 ${timeStr} — ${endTime}`;
  const tw = ctx.measureText(timeTxt).width + pillPX * 2;
  rrect(ctx, px, pillY, tw, pillH, pillR);
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(timeTxt, px + pillPX, pillY + pillH / 2);
  px += tw + 8 * S;

  if (plan.city) {
    const cityTxt = `📍 ${plan.city}`;
    const cw = ctx.measureText(cityTxt).width + pillPX * 2;
    rrect(ctx, px, pillY, cw, pillH, pillR);
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(cityTxt, px + pillPX, pillY + pillH / 2);
  }

  // Separator
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = S;
  ctx.beginPath(); ctx.moveTo(PX, sepY); ctx.lineTo(CW - PX, sepY); ctx.stroke();

  // Participants
  plan.participants.slice(0, 3).forEach((p, i) => {
    const pcx = PX + cr + i * (cr * 2 - 7 * S);
    const pcy = partY + cr;

    if (partImgs[i]) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pcx, pcy, cr, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const imgSize = cr * 2;
      coverDraw(ctx, partImgs[i]!, pcx - cr, pcy - cr, imgSize, imgSize);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(pcx, pcy, cr, 0, Math.PI * 2);
      ctx.strokeStyle = "#636B50";
      ctx.lineWidth = 2 * S;
      ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(pcx, pcy, cr, 0, Math.PI * 2);
      ctx.fillStyle = "#636B50"; ctx.fill();
      ctx.beginPath(); ctx.arc(pcx, pcy, cr - 2 * S, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(i * 60 + 120) % 360}, 40%, 50%)`; ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${10 * S}px -apple-system, "Helvetica Neue", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.name?.charAt(0)?.toUpperCase() || "?", pcx, pcy);
    }
  });

  const n = Math.min(plan.participants.length, 3);
  const joinX = PX + cr + (n > 0 ? (n - 1) * (cr * 2 - 7 * S) + cr : 0) + 10 * S;
  ctx.textAlign = "left";
  ctx.font = `400 ${12 * S}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textBaseline = "middle";
  ctx.fillText(`${plan.participants.length} joined`, joinX, partY + cr);

  if (spotsLeft > 0) {
    ctx.textAlign = "right";
    ctx.font = `600 ${11 * S}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`, CW - PX, partY + cr);
  }

  // Brand
  ctx.textAlign = "left"; ctx.textBaseline = "top";
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

  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.font = `500 ${Math.round(24 * S / 2)}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("Join this plan on slanup.com", SW / 2, cardY + CH + Math.round(50 * S / 2));

  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

// -- Component --

export default function SharePlanCard({ plan, onClose }: SharePlanCardProps) {
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planImageUrl = plan.pic_id ? getS3Url(plan.pic_id) : null;
  const startDate = new Date(plan.start);
  const endDate = new Date(plan.end);
  const dayStr = startDate.getDate().toString();
  const monthStr = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
  const timeStr = startDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTimeStr = endDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const slotsLeft = plan.max_people - plan.participants.length;

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await renderCard(plan);
      setShareFile(
        new File([blob], `slanup-${plan.name.replace(/\s+/g, "-").toLowerCase()}.png`, { type: "image/png" })
      );
    } catch (err) {
      console.error("[ShareCard] render failed:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [plan]);

  useEffect(() => { generate(); }, [generate]);

  const handleShare = async () => {
    if (!shareFile) return;
    try {
      if (navigator.share && navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({
          title: plan.name,
          text: `Check out this plan on Slanup — ${plan.name}`,
          url: `https://www.slanup.com/app/plan/${plan.id}`,
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
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[ShareCard] share error:", err);
        setError("Share failed: " + err.message);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.slanup.com/app/plan/${plan.id}`);
      alert("Link copied!");
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>

        {/* Visual preview */}
        <div style={{ width: 360, padding: 0 }}>
          <div style={{ width: 360, borderRadius: 24, overflow: "hidden", background: "linear-gradient(145deg, #636B50 0%, #4a5239 40%, #2d3220 100%)", fontFamily: "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <div style={{ width: "100%", height: 180, position: "relative", overflow: "hidden" }}>
              {planImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={planImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #7a8460, #4a5239)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>{"📅"}</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
            </div>
            <div style={{ padding: "18px 22px 22px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: -36, position: "relative", zIndex: 2 }}>
                <div style={{ background: "#fff", borderRadius: 14, padding: "10px 14px", textAlign: "center", minWidth: 54, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#262626", lineHeight: 1 }}>{dayStr}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginTop: 2 }}>{monthStr}</div>
                </div>
                <div style={{ flex: 1, paddingTop: 28, minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{plan.name}</div>
                  {plan.venue_string && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>📍 {plan.venue_string}</div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                  🕐 {timeStr} — {endTimeStr}
                </div>
                {plan.city && (
                  <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                    📍 {plan.city}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex" }}>
                    {plan.participants.slice(0, 3).map((p, i) => (
                      <div key={p._id} style={{ width: 26, height: 26, borderRadius: "50%", background: `hsl(${(i * 60 + 120) % 360}, 40%, 50%)`, border: "2px solid #636B50", marginLeft: i > 0 ? -7 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", overflow: "hidden", position: "relative" }}>
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getS3Url(p.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                        ) : (
                          p.name?.charAt(0)?.toUpperCase() || "?"
                        )}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{plan.participants.length} joined</span>
                </div>
                {slotsLeft > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24" }}>{slotsLeft} spot{slotsLeft !== 1 ? "s" : ""} left</span>}
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

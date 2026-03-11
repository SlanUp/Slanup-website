"use client";

import { useState } from "react";
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

// Draw the share card on a canvas — no html2canvas, no CORS issues
async function generateCardImage(plan: SharePlanCardProps["plan"]): Promise<Blob> {
  const W = 1080;
  const H = 1350; // 4:5 story ratio
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#636B50");
  bg.addColorStop(0.4, "#4a5239");
  bg.addColorStop(1, "#2d3220");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Plan image (top 540px)
  let imageLoaded = false;
  if (plan.pic_id) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 5000);
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); reject(); };
        img.src = getS3Url(plan.pic_id!);
      });
      const targetH = 540;
      const imgRatio = img.width / img.height;
      const targetRatio = W / targetH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, targetH);
      imageLoaded = true;

      // Gradient overlay
      const ov = ctx.createLinearGradient(0, 360, 0, 540);
      ov.addColorStop(0, "rgba(0,0,0,0)");
      ov.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = ov;
      ctx.fillRect(0, 360, W, 180);
    } catch {
      // fallback below
    }
  }

  if (!imageLoaded) {
    const g = ctx.createLinearGradient(0, 0, W, 540);
    g.addColorStop(0, "#7a8460");
    g.addColorStop(1, "#4a5239");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 540);
  }

  const startDate = new Date(plan.start);
  const endDate = new Date(plan.end);

  // Date badge
  const bx = 72, by = 570, bw = 160, bh = 120;
  ctx.fillStyle = "#fff";
  roundRect(ctx, bx, by, bw, bh, 36);
  ctx.fill();

  ctx.fillStyle = "#262626";
  ctx.font = "bold 66px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(startDate.getDate().toString(), bx + bw / 2, by + 64);

  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 30px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(startDate.toLocaleString("default", { month: "short" }).toUpperCase(), bx + bw / 2, by + 102);

  // Plan name
  ctx.fillStyle = "#fff";
  ctx.font = "bold 54px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "left";
  const nx = bx + bw + 36;
  wrapText(ctx, plan.name, nx, by + 50, W - nx - 72, 64);

  // Venue
  if (plan.venue_string) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "39px -apple-system, 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(truncate("📍 " + plan.venue_string, 35), nx, by + 110);
  }

  // Time pill
  const py = 740;
  const timeStr = "🕐 " + startDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true }) + " — " + endDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  ctx.font = "39px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  const tw = ctx.measureText(timeStr).width;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, 72, py, tw + 72, 66, 27);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(timeStr, 108, py + 44);

  // City pill
  if (plan.city) {
    const cs = "📍 " + plan.city;
    const cw = ctx.measureText(cs).width;
    const cx = 72 + tw + 72 + 24;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, cx, py, cw + 72, 66, 27);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(cs, cx + 36, py + 44);
  }

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 860);
  ctx.lineTo(W - 72, 860);
  ctx.stroke();

  // Participant circles
  const cy = 920;
  plan.participants.slice(0, 4).forEach((p, i) => {
    const pcx = 108 + i * 60;
    ctx.beginPath();
    ctx.arc(pcx, cy, 36, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(i * 60 + 120) % 360}, 40%, 50%)`;
    ctx.fill();
    ctx.strokeStyle = "#636B50";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px -apple-system, 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.name?.charAt(0)?.toUpperCase() || "?", pcx, cy + 11);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "39px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(`${plan.participants.length} joined`, 108 + Math.min(plan.participants.length, 4) * 60 + 24, cy + 14);

  const slotsLeft = plan.max_people - plan.participants.length;
  if (slotsLeft > 0) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 36px -apple-system, 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(`${slotsLeft} spot${slotsLeft !== 1 ? "s" : ""} left`, W - 72, cy + 14);
  }

  // Branding
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("slanup'", 72, H - 100);
  ctx.font = "24px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("beta", 330, H - 118);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "33px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("slanup.com", W - 72, H - 100);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png", 1.0));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(" ");
  let line = "";
  let ly = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, ly);
      line = word + " ";
      ly += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, ly);
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export default function SharePlanCard({ plan, onClose }: SharePlanCardProps) {
  const [sharing, setSharing] = useState(false);

  const planImageUrl = plan.pic_id ? getS3Url(plan.pic_id) : null;
  const startDate = new Date(plan.start);
  const endDate = new Date(plan.end);
  const dayStr = startDate.getDate().toString();
  const monthStr = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
  const timeStr = startDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTimeStr = endDate.toLocaleString("default", { hour: "numeric", minute: "2-digit", hour12: true });
  const slotsLeft = plan.max_people - plan.participants.length;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const blob = await generateCardImage(plan);
      const file = new File([blob], `slanup-${plan.name.replace(/\s+/g, "-").toLowerCase()}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: plan.name,
          text: `Check out this plan on Slanup — ${plan.name}`,
          url: `https://www.slanup.com/app/plan/${plan.id}`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.slanup.com/app/plan/${plan.id}`);
      alert("Link copied!");
    } catch { /* fallback */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>

        {/* Visual preview */}
        <div style={{ width: 320, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ background: "linear-gradient(145deg, #636B50 0%, #4a5239 40%, #2d3220 100%)", fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif" }}>
            {/* Image */}
            <div style={{ width: "100%", height: 160, overflow: "hidden", position: "relative" }}>
              {planImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={planImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #7a8460, #4a5239)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>📅</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
            </div>

            <div style={{ padding: "16px 20px 20px" }}>
              {/* Date + Title */}
              <div style={{ display: "flex", gap: 12, marginTop: -32, position: "relative", zIndex: 2 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: "8px 12px", textAlign: "center", minWidth: 48, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#262626", lineHeight: 1 }}>{dayStr}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", marginTop: 1 }}>{monthStr}</div>
                </div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{plan.name}</div>
                  {plan.venue_string && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>📍 {plan.venue_string}</div>
                  )}
                </div>
              </div>

              {/* Time + City */}
              <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                  🕐 {timeStr} — {endTimeStr}
                </span>
                {plan.city && (
                  <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                    📍 {plan.city}
                  </span>
                )}
              </div>

              {/* Participants */}
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex" }}>
                    {plan.participants.slice(0, 3).map((p, i) => (
                      <div key={p._id} style={{ width: 24, height: 24, borderRadius: "50%", background: `hsl(${(i * 60 + 120) % 360}, 40%, 50%)`, border: "2px solid #636B50", marginLeft: i > 0 ? -6 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                        {p.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{plan.participants.length} joined</span>
                </div>
                {slotsLeft > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#fbbf24" }}>{slotsLeft} spot{slotsLeft !== 1 ? "s" : ""} left</span>
                )}
              </div>

              {/* Branding */}
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>slanup&apos;<sup style={{ fontSize: 7, verticalAlign: "super" }}>beta</sup></span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>slanup.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-[360px]">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 bg-white text-neutral-800 font-semibold py-3 rounded-xl text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            {sharing ? "Generating..." : "📤 Share to Story"}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl text-sm hover:bg-white/30 transition-colors"
          >
            🔗 Copy Link
          </button>
        </div>

        <button onClick={onClose} className="text-white/60 text-sm hover:text-white transition-colors mt-1">
          Close
        </button>
      </div>
    </div>
  );
}

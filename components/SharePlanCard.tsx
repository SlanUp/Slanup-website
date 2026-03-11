"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
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

async function toDataUrl(url: string, signal?: AbortSignal): Promise<string> {
  const resp = await fetch(url, { signal });
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function SharePlanCard({ plan, onClose }: SharePlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [planImgData, setPlanImgData] = useState<string | null>(null);
  // Pre-generated share file ready for instant navigator.share()
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

  // Pre-generate the share image on mount so navigator.share() can fire instantly
  const generateImage = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      // Step 1: Convert plan image to data URL
      let imgDataUrl: string | null = null;
      if (planImageUrl) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          imgDataUrl = await toDataUrl(planImageUrl, controller.signal);
          clearTimeout(timeout);
          setPlanImgData(imgDataUrl);
        } catch (e) {
          console.warn("[ShareCard] Image data URL conversion failed:", e);
        }
      }

      // Wait for React to re-render with the data URL
      await new Promise((r) => setTimeout(r, 300));

      if (!cardRef.current) throw new Error("Card ref not ready");

      // Step 2: Hide img if data URL failed (prevents tainted canvas)
      const imgEl = cardRef.current.querySelector("img");
      let hiddenImg = false;
      if (imgEl && !imgDataUrl) {
        imgEl.style.display = "none";
        hiddenImg = true;
      }

      try {
        // Step 3: html2canvas capture
        const isMobile = window.innerWidth < 768;
        const canvas = await html2canvas(cardRef.current, {
          scale: isMobile ? 2 : 3,
          backgroundColor: null,
          logging: false,
          useCORS: false,
          allowTaint: false,
        });

        // Step 4: Convert to blob
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png", 0.92)
        );
        if (!blob) throw new Error("toBlob returned null");

        const file = new File(
          [blob],
          `slanup-${plan.name.replace(/\s+/g, "-").toLowerCase()}.png`,
          { type: "image/png" }
        );

        setShareFile(file);
      } finally {
        if (hiddenImg && imgEl) imgEl.style.display = "";
      }
    } catch (err) {
      console.error("[ShareCard] Generation failed:", err);
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGenerating(false);
    }
  }, [planImageUrl, plan.name]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  // Instant share — no async work between user gesture and navigator.share()
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
        // Desktop fallback — download the image
        const url = URL.createObjectURL(shareFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = shareFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[ShareCard] Share failed:", err);
        setError("Share failed: " + err.message);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.slanup.com/app/plan/${plan.id}`);
      alert("Link copied!");
    } catch { /* fallback */ }
  };

  const displayImgSrc = planImgData || planImageUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>

        {/* Single card — used for both preview AND capture */}
        <div ref={cardRef} style={{ width: 360, padding: 0 }}>
          <div
            style={{
              width: 360,
              borderRadius: 24,
              overflow: "hidden",
              background: "linear-gradient(145deg, #636B50 0%, #4a5239 40%, #2d3220 100%)",
              fontFamily: "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            {/* Plan image */}
            <div style={{ width: "100%", height: 180, position: "relative", overflow: "hidden" }}>
              {displayImgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImgSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #7a8460, #4a5239)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>📅</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
            </div>

            {/* Content */}
            <div style={{ padding: "18px 22px 22px" }}>
              {/* Date badge + Title */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: -36, position: "relative", zIndex: 2 }}>
                <div style={{ background: "#fff", borderRadius: 14, padding: "10px 14px", textAlign: "center", minWidth: 54, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#262626", lineHeight: 1 }}>{dayStr}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginTop: 2 }}>{monthStr}</div>
                </div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{plan.name}</div>
                  {plan.venue_string && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      📍 {plan.venue_string}
                    </div>
                  )}
                </div>
              </div>

              {/* Time + City pills */}
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

              {/* Participants + Spots */}
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex" }}>
                    {plan.participants.slice(0, 3).map((p, i) => (
                      <div
                        key={p._id}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: `hsl(${(i * 60 + 120) % 360}, 40%, 50%)`,
                          border: "2px solid #636B50",
                          marginLeft: i > 0 ? -7 : 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {p.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    {plan.participants.length} joined
                  </span>
                </div>
                {slotsLeft > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24" }}>
                    {slotsLeft} spot{slotsLeft !== 1 ? "s" : ""} left
                  </span>
                )}
              </div>

              {/* Branding */}
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>
                  slanup&apos;<sup style={{ fontSize: 7, verticalAlign: "super", marginLeft: 1 }}>beta</sup>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>slanup.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 text-red-200 text-xs px-4 py-2 rounded-lg max-w-[360px] w-full text-center">
            {error}
            <button onClick={generateImage} className="underline ml-2">Retry</button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-[360px]">
          <button
            onClick={handleShare}
            disabled={generating || !shareFile}
            className="flex-1 bg-white text-neutral-800 font-semibold py-3 rounded-xl text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            {generating ? "Generating..." : "📤 Share to Story"}
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

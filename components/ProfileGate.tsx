"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { api, imageUrl } from "@/lib/api/client";
import { ALL_CITIES } from "@/lib/config/cities";
import { Camera, Loader2, AlertTriangle, MessageSquare, X, CheckCircle } from "lucide-react";
import ImageCropper from "@/components/ImageCropper";

const REQUIRED_FIELDS = [
  { key: "image", label: "Profile Photo" },
  { key: "name", label: "Name" },
  { key: "gender", label: "Gender" },
  { key: "city", label: "City" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "instagramHandle", label: "Instagram Handle" },
  { key: "birthdate", label: "Date of Birth" },
] as const;

const SKIP_PATHS = ["/app/onboarding"];

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isLoading, isNewUser, refreshUser } = useAuth();
  const pathname = usePathname();

  const [missing, setMissing] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showConcern, setShowConcern] = useState(false);
  const [concernText, setConcernText] = useState("");
  const [concernSent, setConcernSent] = useState(false);
  const [sendingConcern, setSendingConcern] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading || !isLoggedIn || isNewUser || !user) return;
    if (SKIP_PATHS.some(p => pathname.startsWith(p))) return;

    const missingKeys: string[] = [];
    for (const f of REQUIRED_FIELDS) {
      const val = user[f.key];
      if (!val || (typeof val === "string" && !val.trim())) {
        missingKeys.push(f.key);
      }
    }
    setMissing(missingKeys);
  }, [user, isLoggedIn, isLoading, isNewUser, pathname]);

  if (isLoading || !isLoggedIn || isNewUser || missing.length === 0 || SKIP_PATHS.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleCroppedPhoto = async (croppedFile: File) => {
    setCropImageSrc(null);
    setUploading(true);
    try {
      const key = await api.uploadToS3("profile", croppedFile);
      setProfileImage(key);
    } catch {
      alert("Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    for (const key of missing) {
      if (key === "image" && !profileImage) errs.image = "Profile photo is required";
      if (key === "name" && !form.name?.trim()) errs.name = "Name is required";
      if (key === "gender" && !form.gender) errs.gender = "Please select your gender";
      if (key === "city" && !form.city) errs.city = "Please select your city";
      if (key === "mobileNumber") {
        const digits = (form.mobileNumber || "").replace(/\D/g, "");
        if (digits.length !== 10) errs.mobileNumber = "Enter a valid 10-digit number";
      }
      if (key === "instagramHandle" && !form.instagramHandle?.trim()) errs.instagramHandle = "Instagram handle is required";
      if (key === "birthdate" && !form.birthdate) errs.birthdate = "Date of birth is required";
    }
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (missing.includes("image") && profileImage) payload.image = profileImage;
      if (missing.includes("name")) payload.name = form.name.trim();
      if (missing.includes("gender")) payload.gender = form.gender;
      if (missing.includes("city")) payload.city = form.city;
      if (missing.includes("mobileNumber")) payload.mobileNumber = form.mobileNumber.replace(/\D/g, "");
      if (missing.includes("instagramHandle")) payload.instagramHandle = form.instagramHandle.replace(/\s/g, "").replace(/^@/, "");
      if (missing.includes("birthdate")) payload.birthdate = form.birthdate;

      await api.updateProfile(payload);
      await refreshUser();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleConcern = async () => {
    if (!concernText.trim()) return;
    setSendingConcern(true);
    try {
      await api.submitConcern(concernText.trim());
      setConcernSent(true);
    } catch {
      alert("Failed to send. Please try again.");
    } finally {
      setSendingConcern(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-neutral-800">Complete Your Profile</h1>
          </div>
          <p className="text-sm text-neutral-500 mb-6 ml-[52px]">
            Please fill in the missing details to continue using Slanup.
          </p>

          <div className="flex flex-col gap-5">
            {/* Profile Photo */}
            {missing.includes("image") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">Profile Photo</label>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 hover:border-[var(--brand-green)] cursor-pointer flex items-center justify-center overflow-hidden transition-colors mx-auto"
                >
                  {profileImage ? (
                    <img src={imageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : uploading ? (
                    <Loader2 className="w-6 h-6 text-[var(--brand-green)] animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {fieldErrors.image && <p className="text-xs text-red-500 text-center mt-1">{fieldErrors.image}</p>}
              </div>
            )}

            {/* Name */}
            {missing.includes("name") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Name</label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFieldErrors(p => ({ ...p, name: "" })); }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  placeholder="Your full name"
                />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>
            )}

            {/* Gender */}
            {missing.includes("gender") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Gender</label>
                <div className="flex gap-3">
                  {["male", "female"].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { setForm(p => ({ ...p, gender: g })); setFieldErrors(p => ({ ...p, gender: "" })); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.gender === g
                          ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green)]"
                          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
                {fieldErrors.gender && <p className="text-xs text-red-500 mt-1">{fieldErrors.gender}</p>}
              </div>
            )}

            {/* City */}
            {missing.includes("city") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">City</label>
                <select
                  value={form.city || ""}
                  onChange={e => { setForm(p => ({ ...p, city: e.target.value })); setFieldErrors(p => ({ ...p, city: "" })); }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                >
                  <option value="">Select your city</option>
                  {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
              </div>
            )}

            {/* Mobile Number */}
            {missing.includes("mobileNumber") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobileNumber || ""}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm(p => ({ ...p, mobileNumber: digits }));
                    setFieldErrors(p => ({ ...p, mobileNumber: "" }));
                  }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  placeholder="10 digit mobile number"
                />
                {fieldErrors.mobileNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.mobileNumber}</p>}
              </div>
            )}

            {/* Instagram Handle */}
            {missing.includes("instagramHandle") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={form.instagramHandle || ""}
                  onChange={e => {
                    setForm(p => ({ ...p, instagramHandle: e.target.value.replace(/\s/g, "") }));
                    setFieldErrors(p => ({ ...p, instagramHandle: "" }));
                  }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  placeholder="yourusername"
                />
                {fieldErrors.instagramHandle && <p className="text-xs text-red-500 mt-1">{fieldErrors.instagramHandle}</p>}
              </div>
            )}

            {/* Date of Birth */}
            {missing.includes("birthdate") && (
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  max={today}
                  value={form.birthdate || ""}
                  onChange={e => { setForm(p => ({ ...p, birthdate: e.target.value })); setFieldErrors(p => ({ ...p, birthdate: "" })); }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                />
                {fieldErrors.birthdate && <p className="text-xs text-red-500 mt-1">{fieldErrors.birthdate}</p>}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full mt-8 py-3 bg-[var(--brand-green)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>

          {/* Concern Section */}
          <div className="mt-6 text-center">
            {!showConcern && !concernSent && (
              <button
                onClick={() => setShowConcern(true)}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Having an issue? Raise a concern
              </button>
            )}

            {showConcern && !concernSent && (
              <div className="mt-2 bg-neutral-50 rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-700">Raise a Concern</span>
                  <button onClick={() => setShowConcern(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={concernText}
                  onChange={e => setConcernText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 resize-none"
                  placeholder="Tell us what's wrong..."
                />
                <button
                  onClick={handleConcern}
                  disabled={sendingConcern || !concernText.trim()}
                  className="mt-2 w-full py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {sendingConcern ? "Sending..." : "Submit Concern"}
                </button>
              </div>
            )}

            {concernSent && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--brand-green)]">
                <CheckCircle className="w-4 h-4" />
                Concern submitted — we&apos;ll look into it!
              </div>
            )}
          </div>
        </div>
      </div>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropDone={handleCroppedPhoto}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
}

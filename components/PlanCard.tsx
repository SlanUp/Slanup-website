"use client";

import React from "react";
import Image from "next/image";
import { Heart, ChevronDown } from "lucide-react";
import { Plan } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="w-[340px] flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden mx-2 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-left">
      {/* Profile Section */}
      <div className="flex items-center justify-between p-3 bg-white">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center overflow-hidden relative">
            {plan.creatorProfileImage ? (
              <Image
                src={plan.creatorProfileImage}
                alt={plan.creatorName}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {plan.creatorName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-2">
            <div className="flex items-center text-sm">
              <span className="font-bold">{plan.creatorName}</span>
              <span className="mx-1">shared</span>
              <span className="font-bold">a Plan</span>
            </div>
            <p className="text-xs text-gray-500" suppressHydrationWarning>{formatDate(plan.postedAt)}</p>
          </div>
        </div>
        <div className="text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Plan Image */}
      <div className="w-full h-48 bg-gray-900 overflow-hidden relative">
        <Image
          src={plan.planImageUrl}
          alt={plan.planTitle}
          fill
          className="object-cover"
          sizes="340px"
        />
      </div>

      {/* Event Details */}
      <div className="p-3 bg-white text-left">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center px-3 py-2 bg-gray-100 rounded-lg -mt-8 mb-0 relative z-10 shadow-md w-fit">
          <span className="text-lg font-bold">{plan.eventDate.getDate()}</span>
          <span className="text-xs font-bold text-red-500" suppressHydrationWarning>
            {plan.eventDate.toLocaleString("default", { month: "short" })}
          </span>
        </div>

        {/* Event Info */}
        <div className="mt-1 text-left">
          <h3 className="text-base font-bold text-gray-900">{plan.planTitle}</h3>
          <p className="text-sm text-gray-600 mt-1">Venue: {plan.venue}</p>
        </div>

        {/* Participants and Slots */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            {/* Participant Avatars */}
            <div className="flex -space-x-2">
              {plan.participantImages.slice(0, 4).map((img, index) => (
                <div
                  key={index}
                  className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[var(--brand-green)] to-green-600 overflow-hidden relative"
                  style={{ zIndex: 4 - index }}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt="Participant"
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      ?
                    </div>
                  )}
                </div>
              ))}
            </div>
            {plan.totalParticipants > 4 && (
              <span className="ml-2 text-sm text-gray-700">
                +{plan.totalParticipants - 4}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-red-500 font-medium">
              {plan.slotsLeft} slot{plan.slotsLeft !== 1 ? "s" : ""} left!
            </span>
            <button className="text-gray-400 hover:text-[var(--brand-green)] transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
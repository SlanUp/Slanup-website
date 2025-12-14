"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

export interface Event {
  id: string;
  name: string;
  eventDate: Date;
  venue: string;
  imageUrl: string;
  link: string;
  emoji?: string;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={event.link} className="block">
      <div className="w-[340px] flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-left cursor-pointer">
        {/* Event Image */}
        <div className="w-full h-48 bg-gray-900 overflow-hidden relative">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            sizes="340px"
          />
        </div>

        {/* Event Details */}
        <div className="p-3 bg-white text-left">
          {/* Date Badge */}
          <div className="flex flex-col items-center justify-center px-3 py-2 bg-gray-100 rounded-lg -mt-8 mb-0 relative z-10 shadow-md w-fit">
            <span className="text-lg font-bold">{event.eventDate.getDate()}</span>
            <span className="text-xs font-bold text-red-500" suppressHydrationWarning>
              {event.eventDate.toLocaleString("default", { month: "short" })}
            </span>
          </div>

          {/* Event Info */}
          <div className="mt-1 text-left">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              {event.emoji && <span>{event.emoji}</span>}
              {event.name}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span suppressHydrationWarning>
                {event.eventDate.toLocaleString("default", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* View Event Button */}
          <div className="mt-4">
            <div className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-2 px-4 rounded-lg text-sm text-center transition-colors duration-300">
              View Event
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


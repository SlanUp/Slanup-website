// Event Configuration Registry
// Add new events here - the rest of the system will automatically work with them

import { TicketType, EventConfig } from './types';

// Event-specific configurations
export const EVENT_CONFIGS: Record<string, EventConfig> = {
  diwali: {
    id: 'diwali',
    name: "Slanup's BYOB Diwali Party 2025",
    date: new Date('2025-10-18'),
    venue: "TBD",
    referencePrefix: 'DIW', // For ticket reference numbers
    galleryCode: 'DIWALI2025', // Special invite code for gallery access
    googleDriveFolderId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '',
    theme: {
      background: 'from-black via-neutral-950 to-black',
      textColor: 'text-white',
      primaryColor: 'amber',
      secondaryColor: 'yellow',
      accentColor: 'green',
      emoji: '🪔',
      fontFamily: {
        title: "'Black Ops One', cursive",
        subtitle: "'Dancing Script', cursive"
      }
    },
    ticketTypes: [
      {
        id: 'ultimate',
        name: 'ULTIMATE PARTY EXPERIENCE',
        price: 1699,
        description: 'The most INSANE Diwali party experience you\'ll ever have! 🔥',
        benefits: [
          '🍽️ UNLIMITED Food & Beverages',
          '🎲 Crazy Rules & Games (Prepare to get WASTED!)',
          '✨ Breathtaking Luxury Decor',
          '🏛️ Premium Luxurious Venue',
          '👫 Perfect Balanced Crowd Ratio',
          '🎧 Professional DJ All Night Long',
          '🎯 Exclusive Game Booths & Setups',
          '🍹 Complimentary Welcome Cocktail/Mocktail',
          '🍾 BYOB - Bring Your Own Booze',
          '🥤 All Sides & Mixers Provided',
          '📸 Instagram-Worthy Photo Opportunities',
          '🎊 Unforgettable Memories Guaranteed'
        ],
        available: true,
        maxQuantity: 1
      }
    ] as TicketType[]
  },
  luau: {
    id: 'luau',
    name: "Slanup's Tropical Luau 2025 - Hyderabad",
    date: new Date('2025-11-22'),
    venue: "TBD",
    referencePrefix: 'LUAU',
    galleryCode: 'LUAU2025',
    googleDriveFolderId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '',
    theme: {
      background: 'from-amber-50 via-orange-100 to-teal-100',
      textColor: 'text-neutral-800',
      primaryColor: 'teal',
      secondaryColor: 'emerald',
      accentColor: 'amber',
      emoji: '🌺',
      fontFamily: {
        title: "'Righteous', cursive",
        subtitle: "'Pacifico', cursive"
      }
    },
    ticketTypes: [
      {
        id: 'ultimate',
        name: 'ULTIMATE LUAU EXPERIENCE',
        price: 1999,
        description: 'The most INSANE Tropical Luau party experience you\'ll ever have! 🌺🔥',
        benefits: [
          '🍽️ UNLIMITED Food & Beverages',
          '🎲 Crazy Rules & Games (Prepare to get WASTED!)',
          '✨ Breathtaking Tropical Decor',
          '🏝️ Hawaiian Tiki Bars with Very Minimal Costs',
          '🏛️ Out of This World Property',
          '👫 Perfect Balanced Crowd Ratio',
          '🎧 Professional DJs All Night Long',
          '🎯 Game Booths & Setups',
          '📸 Instagram-Worthy Photo Opportunities',
          '🎊 Unforgettable Memories Guaranteed'
        ],
        available: true,
        maxQuantity: 1
      }
    ] as TicketType[]
  },
  'mafia-soiree': {
    id: 'mafia-soiree',
    name: "Slanup's Mafia Soireé",
    date: new Date('2024-12-31'),
    venue: "TBD",
    referencePrefix: 'MAFIA',
    galleryCode: 'MAFIA2024',
    googleDriveFolderId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '',
    theme: {
      background: 'from-black via-neutral-900 to-black',
      textColor: 'text-white',
      primaryColor: 'red',
      secondaryColor: 'amber',
      accentColor: 'rose',
      emoji: '🎩',
      fontFamily: {
        title: "'Bebas Neue', cursive",
        subtitle: "'Playfair Display', serif"
      }
    },
    ticketTypes: [
      {
        id: 'ultimate',
        name: 'ULTIMATE MAFIA SOIRÉE EXPERIENCE',
        price: 1699,
        description: 'The most INSANE Mafia Soireé experience you\'ll ever have! 🎩🔥',
        benefits: [
          '🍽️ UNLIMITED Food & Beverages',
          '🎲 Crazy Rules & Games (Prepare to get WASTED!)',
          '✨ Breathtaking Mafia-Themed Decor',
          '🏛️ Premium Luxurious Venue',
          '👫 Perfect Balanced Crowd Ratio',
          '🎧 Professional DJ All Night Long',
          '🎯 Exclusive Game Booths & Setups',
          '🍹 Complimentary Welcome Cocktail/Mocktail',
          '📍 Location details will be shared one day prior to the event',
          '📸 Instagram-Worthy Photo Opportunities',
          '🎊 Unforgettable Memories Guaranteed'
        ],
        available: true,
        maxQuantity: 1
      }
    ] as TicketType[]
  }
};

// Helper function to get event config by name
export function getEventConfig(eventName: string): EventConfig | null {
  return EVENT_CONFIGS[eventName.toLowerCase()] || null;
}

// Helper function to get all event names
export function getAllEventNames(): string[] {
  return Object.keys(EVENT_CONFIGS);
}

// Validate event name exists
export function isValidEventName(eventName: string): boolean {
  return eventName.toLowerCase() in EVENT_CONFIGS;
}


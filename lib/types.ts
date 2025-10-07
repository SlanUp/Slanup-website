// Booking and Payment Types

export interface Booking {
  id: string;
  inviteCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: 'regular' | 'premium' | 'vip';
  ticketCount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'cashfree' | 'payu' | 'cash';
  payuTransactionId?: string;
  payuPaymentId?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
  eventDate: Date;
  eventName: string;
  emailSent?: boolean; // Track if ticket email has been sent to prevent duplicates
  expiresAt?: Date; // When pending booking expires (30 minutes from creation)
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: boolean;
  maxQuantity: number;
}

export interface PayUPaymentData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface InviteCodeStatus {
  code: string;
  isUsed: boolean;
  booking?: Booking;
  isValid: boolean;
}

// Event Configuration
export const DIWALI_EVENT_CONFIG = {
  name: "Slanup's Diwali Party 2025",
  date: new Date('2025-10-18'), // 18th October 2025
  venue: "TBD", // Update with actual venue
  ticketTypes: [
    {
      id: 'ultimate',
      name: 'DIWALI CELEBRATION',
      price: 1699,
      description: 'A warm and memorable Diwali celebration experience 🪔',
      benefits: [
        '✨ Beautiful Festive Decor',
        '🏛️ Comfortable Venue',
        '🎧 Professional DJ & Music',
        '🎯 Fun Games & Activities',
        '📸 Photo Opportunities',
        '🎊 Memorable Evening',
        '🪔 Traditional Diwali Ambiance',
        '🎨 Cultural Activities'
      ],
      available: true,
      maxQuantity: 1
    }
  ] as TicketType[]
};

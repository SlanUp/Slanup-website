// Payment Gateway Fee Calculation
// Based on actual Cashfree charges: ~2.24% all-inclusive (fee + GST)

export interface FeeBreakdown {
  ticketPrice: number;          // Original ticket price
  gatewayCharges: number;       // Payment gateway charges (including GST)
  totalAmount: number;          // Total amount customer pays
}

// Cashfree actual charges: 2.24% all-inclusive
const GATEWAY_PERCENTAGE = 0.0224;  // 2.24%

/**
 * Calculate the payment amount including gateway charges
 * Customer pays: Ticket Price + Gateway Charges
 */
export function calculatePaymentWithFees(ticketPrice: number): FeeBreakdown {
  // Calculate gateway charges (round up to nearest paisa)
  const gatewayCharges = Math.ceil(ticketPrice * GATEWAY_PERCENTAGE * 100) / 100;
  
  // Total amount customer pays
  const totalAmount = ticketPrice + gatewayCharges;
  
  return {
    ticketPrice: Math.round(ticketPrice * 100) / 100,
    gatewayCharges: gatewayCharges,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Format fee breakdown for display
 */
export function formatFeeBreakdown(breakdown: FeeBreakdown): string {
  return `Ticket Price: ₹${breakdown.ticketPrice}
Payment Gateway Charges: ₹${breakdown.gatewayCharges}
Total Amount: ₹${breakdown.totalAmount}`;
}

/**
 * Get fees for ticket booking
 */
export function getTicketFees(ticketPrice: number, quantity: number = 1): FeeBreakdown {
  const baseAmount = ticketPrice * quantity;
  return calculatePaymentWithFees(baseAmount);
}

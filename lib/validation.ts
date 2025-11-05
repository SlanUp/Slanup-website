import { z } from 'zod';

// Email validation with proper format
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(100, 'Email too long')
  .toLowerCase()
  .trim();

// Phone number validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Phone must be 10 digits starting with 6-9')
  .length(10, 'Phone must be exactly 10 digits');

// Customer name validation (prevent XSS)
export const nameSchema = z
  .string()
  .min(2, 'Name too short')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters')
  .trim();

// Invite code validation - flexible to allow transformation
export const inviteCodeSchema = z
  .string()
  .min(1, 'Invite code cannot be empty')
  .max(50, 'Invite code too long')
  .transform(val => val.trim().toUpperCase())
  .refine(
    val => /^[A-Z0-9-]+$/.test(val), 
    { message: 'Invite code must contain only letters, numbers, and hyphens' }
  );

// Ticket type validation - accept all possible ticket types
export const ticketTypeSchema = z.enum(['regular', 'premium', 'vip', 'ultimate', 'standard', 'couple']);

// Ticket count validation
export const ticketCountSchema = z
  .number()
  .int('Ticket count must be an integer')
  .min(1, 'Must book at least 1 ticket')
  .max(10, 'Cannot book more than 10 tickets');

// Booking creation schema
export const bookingCreateSchema = z.object({
  inviteCode: inviteCodeSchema,
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  ticketType: ticketTypeSchema,
  ticketCount: ticketCountSchema,
  eventName: z.string().optional() // Optional event name for backward compatibility
});

// Order ID validation (for payment verification)
export const orderIdSchema = z
  .string()
  .regex(/^TXN[0-9a-z]+$/, 'Invalid order ID format')
  .min(10, 'Order ID too short')
  .max(100, 'Order ID too long');

// Webhook payload validation
export const webhookPayloadSchema = z.object({
  data: z.object({
    orderId: z.string(),
    orderAmount: z.string(),
    referenceId: z.string().optional(),
    txStatus: z.string(),
    paymentMode: z.string().optional(),
    txMsg: z.string().optional(),
    txTime: z.string().optional(),
    signature: z.string().optional()
  })
});

// Sanitize HTML to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
}

// Validate and sanitize booking data
export function validateBookingData(data: unknown):
  | { success: true; data: {
      inviteCode: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      ticketType: 'regular' | 'premium' | 'vip' | 'ultimate' | 'standard' | 'couple';
      ticketCount: number;
      eventName?: string;
    }}
  | { success: false; errors: Array<{ field: string; message: string }> } {
  
  const result = bookingCreateSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return { success: false as const, errors };
  }
  
  // Additional sanitization
  const sanitized = {
    ...result.data,
    customerName: sanitizeInput(result.data.customerName),
    customerEmail: sanitizeInput(result.data.customerEmail)
  };
  
  return { success: true as const, data: sanitized };
}

// Validate order ID
export function validateOrderId(orderId: unknown) {
  const result = orderIdSchema.safeParse(orderId);
  
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues[0]?.message || 'Invalid order ID' 
    };
  }
  
  return { success: true, data: result.data };
}

// Validate invite code
export function validateInviteCode(code: unknown): 
  | { success: true; data: string }
  | { success: false; errors: Array<{ field: string; message: string }> } {
  
  // Handle null/undefined/empty values
  if (code === null || code === undefined || code === '') {
    return { 
      success: false as const, 
      errors: [{ field: 'inviteCode', message: 'Invite code is required' }] 
    };
  }
  
  const result = inviteCodeSchema.safeParse(code);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: 'inviteCode',
      message: issue.message
    }));
    return { success: false as const, errors };
  }
  
  return { success: true as const, data: result.data };
}

// Validate Cashfree webhook
export function validateCashfreeWebhook(payload: unknown):
  | { success: true; data: {
      data: {
        orderId: string;
        orderAmount: string;
        referenceId?: string;
        txStatus: string;
        paymentMode?: string;
        txMsg?: string;
        txTime?: string;
        signature?: string;
      }
    }}
  | { success: false; errors: Array<{ field: string; message: string }> } {
  
  const result = webhookPayloadSchema.safeParse(payload);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return { success: false as const, errors };
  }
  
  return { success: true as const, data: result.data };
}

// Validate webhook payload (legacy function)
export function validateWebhookPayload(payload: unknown) {
  const result = webhookPayloadSchema.safeParse(payload);
  
  if (!result.success) {
    return { 
      success: false, 
      error: 'Invalid webhook payload structure' 
    };
  }
  
  return { success: true, data: result.data };
}

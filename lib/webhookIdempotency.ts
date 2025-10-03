import { sql } from '@vercel/postgres';

/**
 * Check if a webhook has already been processed
 * @param webhookId Unique identifier for the webhook (e.g., Cashfree event ID)
 * @returns true if already processed, false if new
 */
export async function isWebhookProcessed(webhookId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM webhook_events 
      WHERE id = ${webhookId}
      LIMIT 1
    `;
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking webhook idempotency:', error);
    // Fail open - allow processing but log the error
    return false;
  }
}

/**
 * Mark a webhook as processed
 * @param webhookId Unique identifier for the webhook
 * @param eventType Type of webhook event (e.g., 'PAYMENT_SUCCESS')
 * @param orderId Associated order ID
 * @param signature Webhook signature for audit trail
 * @param payload Full webhook payload for debugging
 */
export async function markWebhookProcessed(
  webhookId: string,
  eventType: string,
  orderId: string,
  signature: string,
  payload: unknown
): Promise<void> {
  try {
    await sql`
      INSERT INTO webhook_events (id, event_type, order_id, signature, payload)
      VALUES (
        ${webhookId},
        ${eventType},
        ${orderId},
        ${signature},
        ${JSON.stringify(payload)}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
    `;
    
    console.log(`✅ Webhook ${webhookId} marked as processed`);
  } catch (error) {
    console.error('Error marking webhook as processed:', error);
    // Don't throw - webhook was processed successfully, just logging failed
  }
}

/**
 * Clean up old webhook events (older than 30 days)
 * Call this periodically to prevent table bloat
 */
export async function cleanupOldWebhooks(): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM webhook_events
      WHERE created_at < NOW() - INTERVAL '30 days'
    `;
    
    console.log(`🧹 Cleaned up ${result.rowCount} old webhook events`);
  } catch (error) {
    console.error('Error cleaning up old webhooks:', error);
  }
}

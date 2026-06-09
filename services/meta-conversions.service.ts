import { ServerEvent, EventRequest, UserData, CustomData, Content } from 'facebook-nodejs-business-sdk';
import { appendMetaPixelLog, maskMetaPixelIdentifier } from '@/lib/meta-pixel-file-logger';

/**
 * Meta Conversions API Service
 * Sends server-side conversion events to Meta (Facebook) for tracking
 */

interface PurchaseEventData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  amount: number;
  currency?: string;
  orderId: string;
  paymentId?: string;
  eventSourceUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

function buildMetaCapiLogDetails(
  eventName: string,
  data: Partial<PurchaseEventData>,
  pixelId?: string,
  accessToken?: string
) {
  return {
    service: 'meta-conversions',
    eventName,
    pixelId: maskMetaPixelIdentifier(pixelId),
    accessTokenConfigured: Boolean(accessToken),
    testEventCodeConfigured: Boolean(process.env.META_TEST_EVENT_CODE),
    orderId: data.orderId,
    paymentId: data.paymentId,
    amount: data.amount,
    currency: data.currency || 'INR',
    eventSourceUrl: data.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com',
    userData: {
      hasEmail: Boolean(data.email),
      hasPhone: Boolean(data.phone),
      hasFirstName: Boolean(data.firstName),
      hasLastName: Boolean(data.lastName),
      hasIpAddress: Boolean(data.ipAddress),
      hasUserAgent: Boolean(data.userAgent),
    },
  };
}

/**
 * Send Purchase event to Meta Conversions API
 */
export async function sendMetaPurchaseEvent(data: PurchaseEventData): Promise<void> {
  try {
    // Validate required environment variables
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
    const logDetails = buildMetaCapiLogDetails('Purchase', data, pixelId, accessToken);

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_purchase_start',
      level: 'info',
      details: logDetails,
    });

    if (!pixelId || !accessToken) {
      await appendMetaPixelLog({
        source: 'server',
        event: 'capi_purchase_skipped_missing_config',
        level: 'warn',
        details: logDetails,
      });
      console.warn('⚠️ Meta Conversions API not configured. Skipping event tracking.');
      return;
    }

    // Prepare user data with hashing (Meta will hash it again for better privacy)
    const userData = new UserData()
      .setEmails(data.email ? [normalizeAndHash(data.email.toLowerCase().trim())] : [])
      .setPhones(data.phone ? [normalizeAndHash(data.phone.replace(/\D/g, ''))] : [])
      .setClientIpAddress(data.ipAddress)
      .setClientUserAgent(data.userAgent);

    // Set first name and last name if available
    if (data.firstName) {
      userData.setFirstNames([normalizeAndHash(data.firstName.toLowerCase().trim())]);
    }
    if (data.lastName) {
      userData.setLastNames([normalizeAndHash(data.lastName.toLowerCase().trim())]);
    }

    // Prepare custom data for purchase
    const customData = new CustomData()
      .setCurrency(data.currency || 'INR')
      .setValue(data.amount)
      .setOrderId(data.orderId)
      .setContentType('product')
      .setContents([
        new Content()
          .setId('premium_membership')
          .setQuantity(1)
          .setItemPrice(data.amount)
      ]);

    // Create server event
    const serverEvent = new ServerEvent()
      .setEventName('Purchase')
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(data.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com')
      .setActionSource('website');

    // Send event to Meta
    const eventRequest = new EventRequest(accessToken, pixelId)
      .setEvents([serverEvent]);

    // Set test event code if provided (for testing mode)
    if (process.env.META_TEST_EVENT_CODE) {
      eventRequest.setTestEventCode(process.env.META_TEST_EVENT_CODE);
    }

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_purchase_request',
      level: 'info',
      details: logDetails,
    });

    const response = await eventRequest.execute();

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_purchase_success',
      level: 'info',
      details: {
        ...logDetails,
        response: {
          eventsReceived: response.events_received,
          fbtraceId: response.fbtrace_id,
        },
      },
    });

    console.log('✅ Meta Purchase event sent successfully:', {
      orderId: data.orderId,
      amount: data.amount,
      eventsReceived: response.events_received,
      fbtrace_id: response.fbtrace_id,
    });

  } catch (error: any) {
    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_purchase_error',
      level: 'error',
      details: {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency || 'INR',
      },
      error,
    });
    // Log error but don't throw - conversion tracking failures shouldn't break payment flow
    console.error('❌ Failed to send Meta Purchase event:', error.message);
    if (error.response?.data) {
      console.error('Meta API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

/**
 * Send InitiateCheckout event to Meta Conversions API
 */
export async function sendMetaInitiateCheckoutEvent(data: Omit<PurchaseEventData, 'paymentId'>): Promise<void> {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
    const logDetails = buildMetaCapiLogDetails('InitiateCheckout', data, pixelId, accessToken);

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_initiate_checkout_start',
      level: 'info',
      details: logDetails,
    });

    if (!pixelId || !accessToken) {
      await appendMetaPixelLog({
        source: 'server',
        event: 'capi_initiate_checkout_skipped_missing_config',
        level: 'warn',
        details: logDetails,
      });
      console.warn('⚠️ Meta Conversions API not configured. Skipping event tracking.');
      return;
    }

    const userData = new UserData()
      .setEmails(data.email ? [normalizeAndHash(data.email.toLowerCase().trim())] : [])
      .setPhones(data.phone ? [normalizeAndHash(data.phone.replace(/\D/g, ''))] : [])
      .setClientIpAddress(data.ipAddress)
      .setClientUserAgent(data.userAgent);

    if (data.firstName) {
      userData.setFirstNames([normalizeAndHash(data.firstName.toLowerCase().trim())]);
    }
    if (data.lastName) {
      userData.setLastNames([normalizeAndHash(data.lastName.toLowerCase().trim())]);
    }

    const customData = new CustomData()
      .setCurrency(data.currency || 'INR')
      .setValue(data.amount)
      .setContentType('product')
      .setContents([
        new Content()
          .setId('premium_membership')
          .setQuantity(1)
          .setItemPrice(data.amount)
      ]);

    const serverEvent = new ServerEvent()
      .setEventName('InitiateCheckout')
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(data.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com')
      .setActionSource('website');

    const eventRequest = new EventRequest(accessToken, pixelId)
      .setEvents([serverEvent]);

    // Set test event code if provided (for testing mode)
    if (process.env.META_TEST_EVENT_CODE) {
      eventRequest.setTestEventCode(process.env.META_TEST_EVENT_CODE);
    }

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_initiate_checkout_request',
      level: 'info',
      details: logDetails,
    });

    const response = await eventRequest.execute();

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_initiate_checkout_success',
      level: 'info',
      details: {
        ...logDetails,
        response: {
          eventsReceived: response.events_received,
          fbtraceId: response.fbtrace_id,
        },
      },
    });

    console.log('✅ Meta InitiateCheckout event sent successfully:', {
      orderId: data.orderId,
      amount: data.amount,
      eventsReceived: response.events_received,
    });

  } catch (error: any) {
    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_initiate_checkout_error',
      level: 'error',
      details: {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency || 'INR',
      },
      error,
    });
    console.error('❌ Failed to send Meta InitiateCheckout event:', error.message);
  }
}

/**
 * Normalize and hash data for Meta's privacy requirements
 * Meta expects SHA-256 hashed values for PII
 */
function normalizeAndHash(value: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Test Meta Conversions API connection
 */
export async function testMetaConversionsAPI(): Promise<{ success: boolean; message: string }> {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
    const logDetails = buildMetaCapiLogDetails('PageView', {
      amount: 1,
      currency: 'INR',
      eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
    }, pixelId, accessToken);

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_test_start',
      level: 'info',
      details: logDetails,
    });

    if (!pixelId || !accessToken) {
      await appendMetaPixelLog({
        source: 'server',
        event: 'capi_test_skipped_missing_config',
        level: 'warn',
        details: logDetails,
      });
      return {
        success: false,
        message: 'Meta Pixel ID or Access Token not configured',
      };
    }

    // Send a test event
    const userData = new UserData()
      .setEmails([normalizeAndHash('test@example.com')])
      .setClientIpAddress('127.0.0.1')
      .setClientUserAgent('Test Agent');

    const customData = new CustomData()
      .setCurrency('INR')
      .setValue(1);

    const serverEvent = new ServerEvent()
      .setEventName('PageView')
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com')
      .setActionSource('website');

    const eventRequest = new EventRequest(accessToken, pixelId)
      .setEvents([serverEvent]);

    // Set test event code if provided (for testing mode)
    if (process.env.META_TEST_EVENT_CODE) {
      eventRequest.setTestEventCode(process.env.META_TEST_EVENT_CODE);
    }

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_test_request',
      level: 'info',
      details: logDetails,
    });

    const response = await eventRequest.execute();

    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_test_success',
      level: 'info',
      details: {
        ...logDetails,
        response: {
          eventsReceived: response.events_received,
          fbtraceId: response.fbtrace_id,
        },
      },
    });

    return {
      success: true,
      message: `Meta Conversions API connected successfully. Events received: ${response.events_received}`,
    };

  } catch (error: any) {
    await appendMetaPixelLog({
      source: 'server',
      event: 'capi_test_error',
      level: 'error',
      details: {
        pixelId: maskMetaPixelIdentifier(process.env.META_PIXEL_ID),
        accessTokenConfigured: Boolean(process.env.META_CONVERSIONS_API_ACCESS_TOKEN),
      },
      error,
    });
    return {
      success: false,
      message: `Meta Conversions API error: ${error.message}`,
    };
  }
}

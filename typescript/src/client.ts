import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import { Agents } from './resources/agents';
import { Calls } from './resources/calls';
import { Campaigns } from './resources/campaigns';
import { Knowledge } from './resources/knowledge';
import { Analytics } from './resources/analytics';
import { Integrations } from './resources/integrations';
import { PhoneNumbers } from './resources/phone-numbers';
import { ApiKeys } from './resources/api-keys';
import { VoiceCloning } from './resources/voice-cloning';
import { Webhooks } from './resources/webhooks';
import { PollaxError } from './errors';

/**
 * Rate-limit info parsed from the last response. Stripe-style.
 */
export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
}

export interface PollaxConfig {
  /**
   * Your Pollax API key (required)
   * Get it from https://pollax.ai/settings/api-keys
   */
  apiKey: string;

  /**
   * Base URL for the Pollax API
   * @default 'https://api.pollax.ai'
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Organization/tenant ID (optional)
   * If provided, all requests will be scoped to this organization
   */
  tenantId?: string;
}

export class Pollax {
  private client: AxiosInstance;
  private maxRetries: number;

  /**
   * Rate-limit info from the last completed request, or null before the first
   * request. Stripe-style — read it after any call to check headroom.
   *
   * @example
   * await pollax.calls.create({...});
   * console.log('remaining', pollax.lastRateLimit?.remaining);
   */
  public lastRateLimit: RateLimitInfo | null = null;

  // Resource interfaces
  public readonly agents: Agents;
  public readonly calls: Calls;
  public readonly campaigns: Campaigns;
  public readonly knowledge: Knowledge;
  public readonly analytics: Analytics;
  public readonly integrations: Integrations;
  public readonly phoneNumbers: PhoneNumbers;
  public readonly apiKeys: ApiKeys;
  public readonly voiceCloning: VoiceCloning;
  public readonly webhooks: Webhooks;

  constructor(config: PollaxConfig) {
    if (!config.apiKey) {
      throw new PollaxError('API key is required. Get one at https://pollax.ai/settings/api-keys');
    }

    this.maxRetries = config.maxRetries || 3;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Pollax-SDK-TypeScript/1.1.0',
    };

    if (config.tenantId) {
      headers['X-Tenant-ID'] = config.tenantId;
    }

    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.pollax.ai',
      timeout: config.timeout || 30000,
      headers,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Capture rate-limit info from every successful response so callers
        // can inspect it via client.lastRateLimit (Stripe-style pattern).
        this.captureRateLimit(response.headers);
        return response;
      },
      async (error) => {
        if (error.response) {
          // Capture rate-limit info even on errors so 429 handlers can see it.
          this.captureRateLimit(error.response.headers);
          const { status, data } = error.response;

          // Handle rate limiting with exponential backoff
          if (status === 429 && this.maxRetries > 0) {
            const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
            await this.sleep(retryAfter * 1000);
            return this.client.request(error.config);
          }

          throw new PollaxError(
            data?.error?.message || data?.error || data?.detail || 'An error occurred',
            status,
            data
          );
        }

        throw new PollaxError(
          error.message || 'Network error occurred',
          0,
          error
        );
      }
    );

    // Initialize resources
    this.agents = new Agents(this.request.bind(this));
    this.calls = new Calls(this.request.bind(this));
    this.campaigns = new Campaigns(this.request.bind(this));
    this.knowledge = new Knowledge(this.request.bind(this));
    this.analytics = new Analytics(this.request.bind(this));
    this.integrations = new Integrations(this.request.bind(this));
    this.phoneNumbers = new PhoneNumbers(this.request.bind(this));
    this.apiKeys = new ApiKeys(this.request.bind(this));
    this.voiceCloning = new VoiceCloning(this.request.bind(this));
    this.webhooks = new Webhooks(this.request.bind(this));
  }

  /**
   * Verify the signature of an incoming webhook from Pollax.
   *
   * Pollax POSTs every event with header
   *   `Pollax-Signature: t=<unix>,v1=<hmac-sha256(timestamp.body)>`
   *
   * Call this from your webhook handler BEFORE trusting the payload. Use the
   * raw request body (bytes / string) — NOT the parsed JSON.
   *
   * Throws `PollaxError` on invalid signature or timestamp outside tolerance.
   *
   * @example
   * // Express, with raw body parser:
   * app.post('/pollax-events',
   *   express.raw({ type: 'application/json' }),
   *   (req, res) => {
   *     Pollax.verifyWebhookSignature(
   *       req.body,
   *       req.header('Pollax-Signature')!,
   *       process.env.POLLAX_WEBHOOK_SECRET!,
   *     );
   *     // ...trusted; process event
   *   }
   * );
   */
  static verifyWebhookSignature(
    rawBody: string | Buffer,
    signatureHeader: string | null | undefined,
    secret: string,
    toleranceSeconds: number = 300,
  ): true {
    if (!signatureHeader) {
      throw new PollaxError('Missing Pollax-Signature header', 400);
    }
    if (!secret) {
      throw new PollaxError('Webhook signing secret is empty', 500);
    }

    // Parse `t=<unix>,v1=<hex>`. Tolerate additional schemes (v2, etc.) by
    // taking the v1 part if present.
    const parts: Record<string, string> = {};
    for (const segment of signatureHeader.split(',')) {
      const [k, v] = segment.split('=');
      if (k && v != null) parts[k.trim()] = v.trim();
    }
    const t = parts['t'];
    const v1 = parts['v1'];
    if (!t || !v1) {
      throw new PollaxError('Malformed Pollax-Signature header', 400);
    }

    const bodyString =
      typeof rawBody === 'string' ? rawBody : Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${t}.${bodyString}`)
      .digest('hex');

    // Length-mismatched timingSafeEqual throws — guard explicitly.
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(v1, 'hex');
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      throw new PollaxError('Webhook signature does not match', 401);
    }

    const timestampNum = Number(t);
    if (!Number.isFinite(timestampNum)) {
      throw new PollaxError('Webhook signature timestamp is not numeric', 400);
    }
    const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampNum);
    if (ageSeconds > toleranceSeconds) {
      throw new PollaxError(
        `Webhook signature timestamp outside tolerance (${ageSeconds}s > ${toleranceSeconds}s)`,
        401,
      );
    }

    return true;
  }

  /**
   * Make an HTTP request with automatic retries
   */
  async request<T = any>(config: AxiosRequestConfig, retries = 0): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      // Retry on network errors or 5xx server errors
      if (
        retries < this.maxRetries &&
        (error.code === 'ECONNRESET' || 
         error.code === 'ETIMEDOUT' ||
         (error.response && error.response.status >= 500))
      ) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        await this.sleep(delay);
        return this.request<T>(config, retries + 1);
      }

      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Read rate-limit headers from a response (Stripe/Twilio-style
   * `X-RateLimit-*` OR the RFC 6585 `RateLimit-*` aliases the Pollax backend
   * emits) and store the parsed values on `this.lastRateLimit`.
   */
  private captureRateLimit(headers: Record<string, any> | undefined): void {
    if (!headers) return;
    const pick = (...names: string[]): number | null => {
      for (const n of names) {
        const v = headers[n] ?? headers[n.toLowerCase()];
        if (v != null) {
          const num = Number(v);
          return Number.isFinite(num) ? num : null;
        }
      }
      return null;
    };

    const limit = pick('x-ratelimit-limit', 'ratelimit-limit');
    const remaining = pick('x-ratelimit-remaining', 'ratelimit-remaining');
    const reset = pick('x-ratelimit-reset', 'ratelimit-reset');

    if (limit === null && remaining === null && reset === null) {
      this.lastRateLimit = null;
      return;
    }
    this.lastRateLimit = { limit, remaining, reset };
  }
}

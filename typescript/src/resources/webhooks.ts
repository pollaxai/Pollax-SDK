import { AxiosRequestConfig } from 'axios';

/**
 * Webhook subscription — tells Pollax where to POST events.
 */
export interface WebhookSubscription {
  id: string;
  tenant_id: string;
  url: string;
  events: string[];
  description?: string | null;
  is_active: boolean;
  failure_count: number;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  disabled_at?: string | null;
  created_at: string;
  /**
   * Only returned on create + rotate-secret. Store it; Pollax cannot show it again.
   * Use it with `Pollax.verifyWebhookSignature(...)` on your server.
   */
  signing_secret?: string;
}

export interface CreateWebhookParams {
  url: string;
  /**
   * Event types to subscribe to. Use `['*']` for all.
   * Examples: ['call.completed', 'call.failed', 'campaign.finished'].
   */
  events?: string[];
  description?: string;
}

export interface UpdateWebhookParams {
  url?: string;
  events?: string[];
  description?: string;
  is_active?: boolean;
}

/**
 * One delivery attempt of a webhook event.
 */
export interface WebhookDelivery {
  id: string;
  event_id: string;
  event_type: string;
  status: 'pending' | 'succeeded' | 'failed' | 'abandoned';
  attempts: number;
  response_status?: number | null;
  error?: string | null;
  created_at: string;
  completed_at?: string | null;
  next_retry_at?: string | null;
}

export interface ListDeliveriesParams {
  limit?: number;
}

export class Webhooks {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a webhook subscription. Pollax will POST signed events to `url`.
   *
   * The response includes `signing_secret` ONCE — save it; you'll need it to
   * verify incoming webhook signatures on your server. See
   * `Pollax.verifyWebhookSignature()`.
   *
   * @example
   * const sub = await pollax.webhooks.create({
   *   url: 'https://your-server.com/pollax-events',
   *   events: ['call.completed', 'call.failed'],
   *   description: 'Production events',
   * });
   * console.log('Secret (save this):', sub.signing_secret);
   */
  async create(params: CreateWebhookParams): Promise<WebhookSubscription> {
    return this.request<WebhookSubscription>({
      method: 'POST',
      url: '/api/v1/webhooks',
      data: params,
    });
  }

  /**
   * List webhook subscriptions for the current tenant.
   */
  async list(): Promise<{ data: WebhookSubscription[]; has_more: boolean }> {
    return this.request({
      method: 'GET',
      url: '/api/v1/webhooks',
    });
  }

  /**
   * Get a single subscription by ID.
   */
  async retrieve(id: string): Promise<WebhookSubscription> {
    return this.request<WebhookSubscription>({
      method: 'GET',
      url: `/api/v1/webhooks/${id}`,
    });
  }

  /**
   * Update a subscription (toggle active, change URL or event list).
   *
   * Re-enabling a disabled webhook (`is_active: true`) clears `disabled_at`
   * and resets the failure counter.
   */
  async update(id: string, params: UpdateWebhookParams): Promise<WebhookSubscription> {
    return this.request<WebhookSubscription>({
      method: 'PUT',
      url: `/api/v1/webhooks/${id}`,
      data: params,
    });
  }

  /**
   * Delete a subscription.
   */
  async delete(id: string): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `/api/v1/webhooks/${id}`,
    });
  }

  /**
   * Rotate the signing secret for a subscription. The old secret stops
   * verifying immediately — coordinate the swap on your server.
   *
   * The response includes the new `signing_secret` ONCE.
   */
  async rotateSecret(id: string): Promise<WebhookSubscription> {
    return this.request<WebhookSubscription>({
      method: 'POST',
      url: `/api/v1/webhooks/${id}/rotate-secret`,
    });
  }

  /**
   * List recent delivery attempts for a subscription. Useful for debugging
   * why an integration isn't receiving events.
   */
  async listDeliveries(
    id: string,
    params?: ListDeliveriesParams,
  ): Promise<{ data: WebhookDelivery[]; has_more: boolean }> {
    return this.request({
      method: 'GET',
      url: `/api/v1/webhooks/${id}/deliveries`,
      params,
    });
  }
}

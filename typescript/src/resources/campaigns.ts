import { AxiosRequestConfig } from 'axios';
import {
  Campaign,
  CreateCampaignParams,
  UpdateCampaignParams,
} from '../types';
import { RequestOptions } from './calls';

function buildHeaders(opts?: RequestOptions): Record<string, string> | undefined {
  if (opts?.idempotencyKey) {
    return { 'Idempotency-Key': opts.idempotencyKey };
  }
  return undefined;
}

export class Campaigns {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new campaign.
   *
   * @example
   * const campaign = await pollax.campaigns.create(
   *   {
   *     name: 'Q1 Outreach Campaign',
   *     agent_id: 'agent_123',
   *     contacts: [
   *       { name: 'John Doe', phone: '+1234567890' },
   *       { name: 'Jane Smith', phone: '+0987654321' },
   *     ],
   *   },
   *   { idempotencyKey: 'q1-outreach-launch' }
   * );
   */
  async create(params: CreateCampaignParams, options?: RequestOptions): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: '/api/v1/campaigns',
      data: params,
      headers: buildHeaders(options),
    });
  }

  /**
   * List all campaigns
   * 
   * @example
   * const campaigns = await pollax.campaigns.list();
   */
  async list(): Promise<Campaign[]> {
    return this.request<Campaign[]>({
      method: 'GET',
      url: '/api/v1/campaigns',
    });
  }

  /**
   * Get a single campaign by ID
   * 
   * @example
   * const campaign = await pollax.campaigns.retrieve('campaign_123');
   */
  async retrieve(campaignId: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'GET',
      url: `/api/v1/campaigns/${campaignId}`,
    });
  }

  /**
   * Update a campaign
   * 
   * @example
   * const campaign = await pollax.campaigns.update('campaign_123', {
   *   status: 'paused',
   * });
   */
  async update(campaignId: string, params: UpdateCampaignParams): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'PUT',
      url: `/api/v1/campaigns/${campaignId}`,
      data: params,
    });
  }

  /**
   * Delete a campaign
   * 
   * @example
   * await pollax.campaigns.delete('campaign_123');
   */
  async delete(campaignId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/campaigns/${campaignId}`,
    });
  }

  /**
   * Start a campaign
   * 
   * @example
   * await pollax.campaigns.start('campaign_123');
   */
  async start(campaignId: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: `/api/v1/campaigns/${campaignId}/start`,
    });
  }

  /**
   * Pause a running campaign
   * 
   * @example
   * await pollax.campaigns.pause('campaign_123');
   */
  async pause(campaignId: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: `/api/v1/campaigns/${campaignId}/pause`,
    });
  }

  /**
   * Resume a paused campaign.
   *
   * @example
   * await pollax.campaigns.resume('campaign_123');
   */
  async resume(campaignId: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: `/api/v1/campaigns/${campaignId}/resume`,
    });
  }

  /**
   * Stop a campaign (mark it complete; no further calls are placed).
   *
   * @example
   * await pollax.campaigns.complete('campaign_123');
   */
  async complete(campaignId: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: `/api/v1/campaigns/${campaignId}/complete`,
    });
  }

  /**
   * Upload contacts to a campaign via CSV
   * 
   * @example
   * const campaign = await pollax.campaigns.uploadContacts('campaign_123', csvFile);
   */
  async uploadContacts(campaignId: string, file: File | Buffer): Promise<Campaign> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<Campaign>({
      method: 'POST',
      url: `/api/v1/campaigns/${campaignId}/upload`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get campaign statistics
   * 
   * @example
   * const stats = await pollax.campaigns.getStats('campaign_123');
   */
  async getStats(campaignId: string): Promise<{
    total_contacts: number;
    completed_calls: number;
    successful_calls: number;
    failed_calls: number;
    success_rate: string;
  }> {
    return this.request({
      method: 'GET',
      url: `/api/v1/campaigns/${campaignId}/stats`,
    });
  }
}

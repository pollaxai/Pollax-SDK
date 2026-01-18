import { AxiosRequestConfig } from 'axios';
import { Integration, CreateIntegrationParams } from '../types';

export class Integrations {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new integration
   * 
   * @example
   * const integration = await pollax.integrations.create({
   *   name: 'Salesforce CRM',
   *   type: 'salesforce',
   *   config: {
   *     client_id: '...',
   *     client_secret: '...',
   *   },
   * });
   */
  async create(params: CreateIntegrationParams): Promise<Integration> {
    return this.request<Integration>({
      method: 'POST',
      url: '/api/v1/integrations',
      data: params,
    });
  }

  /**
   * List all integrations
   * 
   * @example
   * const integrations = await pollax.integrations.list();
   */
  async list(): Promise<Integration[]> {
    return this.request<Integration[]>({
      method: 'GET',
      url: '/api/v1/integrations',
    });
  }

  /**
   * Get a single integration by ID
   * 
   * @example
   * const integration = await pollax.integrations.retrieve('int_123');
   */
  async retrieve(integrationId: string): Promise<Integration> {
    return this.request<Integration>({
      method: 'GET',
      url: `/api/v1/integrations/${integrationId}`,
    });
  }

  /**
   * Delete an integration
   * 
   * @example
   * await pollax.integrations.delete('int_123');
   */
  async delete(integrationId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/integrations/${integrationId}`,
    });
  }
}

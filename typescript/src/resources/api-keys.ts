import { AxiosRequestConfig } from 'axios';
import { ApiKey, CreateApiKeyParams } from '../types';

export class ApiKeys {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new API key
   * 
   * @example
   * const apiKey = await pollax.apiKeys.create({
   *   name: 'Production Key',
   *   permissions: ['read', 'write'],
   * });
   */
  async create(params: CreateApiKeyParams): Promise<ApiKey & { key: string }> {
    return this.request<ApiKey & { key: string }>({
      method: 'POST',
      url: '/api/v1/api-keys',
      data: params,
    });
  }

  /**
   * List all API keys
   * 
   * @example
   * const keys = await pollax.apiKeys.list();
   */
  async list(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>({
      method: 'GET',
      url: '/api/v1/api-keys',
    });
  }

  /**
   * Revoke an API key
   * 
   * @example
   * await pollax.apiKeys.revoke('key_123');
   */
  async revoke(keyId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/api-keys/${keyId}`,
    });
  }
}

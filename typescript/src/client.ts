import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Agents } from './resources/agents';
import { Calls } from './resources/calls';
import { Campaigns } from './resources/campaigns';
import { Knowledge } from './resources/knowledge';
import { Analytics } from './resources/analytics';
import { Integrations } from './resources/integrations';
import { PhoneNumbers } from './resources/phone-numbers';
import { ApiKeys } from './resources/api-keys';
import { VoiceCloning } from './resources/voice-cloning';
import { PollaxError } from './errors';

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

  constructor(config: PollaxConfig) {
    if (!config.apiKey) {
      throw new PollaxError('API key is required. Get one at https://pollax.ai/settings/api-keys');
    }

    this.maxRetries = config.maxRetries || 3;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Pollax-SDK-TypeScript/1.0.0',
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
      (response) => response,
      async (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          // Handle rate limiting with exponential backoff
          if (status === 429 && this.maxRetries > 0) {
            const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
            await this.sleep(retryAfter * 1000);
            return this.client.request(error.config);
          }

          throw new PollaxError(
            data.error || data.detail || 'An error occurred',
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
}

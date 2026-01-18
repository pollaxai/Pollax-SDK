import { AxiosRequestConfig } from 'axios';
import { DashboardStats, CallVolumeData } from '../types';

export class Analytics {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Get dashboard statistics
   * 
   * @example
   * const stats = await pollax.analytics.getStats();
   */
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>({
      method: 'GET',
      url: '/api/v1/analytics/stats',
    });
  }

  /**
   * Get call volume over time
   * 
   * @example
   * const volume = await pollax.analytics.getCallVolume({ period: '7d' });
   */
  async getCallVolume(params?: { period?: '24h' | '7d' | '30d' }): Promise<CallVolumeData> {
    return this.request<CallVolumeData>({
      method: 'GET',
      url: '/api/v1/analytics/call-volume',
      params,
    });
  }

  /**
   * Get agent performance metrics
   * 
   * @example
   * const performance = await pollax.analytics.getAgentPerformance('agent_123');
   */
  async getAgentPerformance(agentId: string): Promise<{
    total_calls: number;
    success_rate: string;
    avg_duration: string;
    total_minutes: number;
  }> {
    return this.request({
      method: 'GET',
      url: `/api/v1/analytics/agents/${agentId}/performance`,
    });
  }

  /**
   * Export analytics data
   * 
   * @example
   * const csvData = await pollax.analytics.export({
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31',
   *   format: 'csv',
   * });
   */
  async export(params: {
    start_date: string;
    end_date: string;
    format?: 'csv' | 'json';
  }): Promise<string | object> {
    return this.request({
      method: 'GET',
      url: '/api/v1/analytics/export',
      params,
    });
  }
}

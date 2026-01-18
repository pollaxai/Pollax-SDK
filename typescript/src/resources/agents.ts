import { AxiosRequestConfig } from 'axios';
import {
  Agent,
  CreateAgentParams,
  UpdateAgentParams,
  ListAgentsParams,
} from '../types';

export class Agents {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new AI agent
   * 
   * @example
   * const agent = await pollax.agents.create({
   *   name: 'Customer Support Agent',
   *   system_prompt: 'You are a helpful customer support agent.',
   *   voice_id: 'alloy',
   *   model: 'gpt-4',
   * });
   */
  async create(params: CreateAgentParams): Promise<Agent> {
    return this.request<Agent>({
      method: 'POST',
      url: '/api/v1/agents',
      data: params,
    });
  }

  /**
   * List all agents
   * 
   * @example
   * const agents = await pollax.agents.list({ is_active: true });
   */
  async list(params?: ListAgentsParams): Promise<Agent[]> {
    return this.request<Agent[]>({
      method: 'GET',
      url: '/api/v1/agents',
      params,
    });
  }

  /**
   * Get a single agent by ID
   * 
   * @example
   * const agent = await pollax.agents.retrieve('agent_123');
   */
  async retrieve(agentId: string): Promise<Agent> {
    return this.request<Agent>({
      method: 'GET',
      url: `/api/v1/agents/${agentId}`,
    });
  }

  /**
   * Update an agent
   * 
   * @example
   * const agent = await pollax.agents.update('agent_123', {
   *   name: 'Updated Agent Name',
   *   is_active: false,
   * });
   */
  async update(agentId: string, params: UpdateAgentParams): Promise<Agent> {
    return this.request<Agent>({
      method: 'PUT',
      url: `/api/v1/agents/${agentId}`,
      data: params,
    });
  }

  /**
   * Delete an agent
   * 
   * @example
   * await pollax.agents.delete('agent_123');
   */
  async delete(agentId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/agents/${agentId}`,
    });
  }

  /**
   * Test an agent with a sample prompt
   * 
   * @example
   * const response = await pollax.agents.test('agent_123', {
   *   message: 'Hello, how can you help me?',
   * });
   */
  async test(agentId: string, params: { message: string }): Promise<{ response: string }> {
    return this.request({
      method: 'POST',
      url: `/api/v1/agents/${agentId}/test`,
      data: params,
    });
  }
}

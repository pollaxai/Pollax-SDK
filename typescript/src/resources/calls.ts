import { AxiosRequestConfig } from 'axios';
import {
  Call,
  CreateCallParams,
  ListCallsParams,
} from '../types';

/**
 * Options accepted on mutating requests.
 */
export interface RequestOptions {
  /**
   * Send `Idempotency-Key: <value>` so a retry of the same request with the
   * same body returns the cached response instead of double-charging /
   * double-dialing. Any UUID or unique string up to 255 chars works.
   * See https://docs.pollax.ai/api#idempotency for details.
   */
  idempotencyKey?: string;
}

function buildHeaders(opts?: RequestOptions): Record<string, string> | undefined {
  if (opts?.idempotencyKey) {
    return { 'Idempotency-Key': opts.idempotencyKey };
  }
  return undefined;
}

export class Calls {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new voice call.
   *
   * @example
   * const call = await pollax.calls.create(
   *   { agent_id: 'agent_123', to_number: '+1234567890' },
   *   { idempotencyKey: `order-${orderId}` }
   * );
   */
  async create(params: CreateCallParams, options?: RequestOptions): Promise<Call> {
    return this.request<Call>({
      method: 'POST',
      url: '/api/v1/calls',
      data: params,
      headers: buildHeaders(options),
    });
  }

  /**
   * List all calls
   * 
   * @example
   * const calls = await pollax.calls.list({
   *   agent_id: 'agent_123',
   *   status: 'completed',
   * });
   */
  async list(params?: ListCallsParams): Promise<Call[]> {
    return this.request<Call[]>({
      method: 'GET',
      url: '/api/v1/calls',
      params,
    });
  }

  /**
   * Get a single call by SID
   * 
   * @example
   * const call = await pollax.calls.retrieve('CA123456789');
   */
  async retrieve(callSid: string): Promise<Call> {
    return this.request<Call>({
      method: 'GET',
      url: `/api/v1/calls/${callSid}`,
    });
  }

  /**
   * End an active call
   * 
   * @example
   * await pollax.calls.end('CA123456789');
   */
  async end(callSid: string): Promise<Call> {
    return this.request<Call>({
      method: 'POST',
      url: `/api/v1/calls/${callSid}/end`,
    });
  }

  /**
   * Transfer a call to another number
   * 
   * @example
   * await pollax.calls.transfer('CA123456789', {
   *   to_number: '+1234567890',
   * });
   */
  async transfer(callSid: string, params: { to_number: string }): Promise<Call> {
    return this.request<Call>({
      method: 'POST',
      url: `/api/v1/calls/${callSid}/transfer`,
      data: params,
    });
  }

  /**
   * Get call transcript
   * 
   * @example
   * const transcript = await pollax.calls.getTranscript('CA123456789');
   */
  async getTranscript(callSid: string): Promise<{ transcript: string; messages: any[] }> {
    return this.request({
      method: 'GET',
      url: `/api/v1/calls/${callSid}/transcript`,
    });
  }

  /**
   * Get call recording URL
   * 
   * @example
   * const recording = await pollax.calls.getRecording('CA123456789');
   */
  async getRecording(callSid: string): Promise<{ url: string }> {
    return this.request({
      method: 'GET',
      url: `/api/v1/calls/${callSid}/recording`,
    });
  }
}

/**
 * Agent configuration and types
 */

export interface Agent {
  id: string;
  name: string;
  description?: string;
  system_prompt: string;
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  voice_provider?: 'elevenlabs' | 'openai' | 'google';
  voice_id?: string;
  stt_provider?: 'deepgram' | 'whisper' | 'google';
  temperature?: number;
  max_tokens?: number;
  is_active: boolean;
  tenant_id: string;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
  calls_count?: number;
  success_rate?: string;
  avg_duration?: string;
}

export interface CreateAgentParams {
  name: string;
  system_prompt: string;
  description?: string;
  provider?: 'openai' | 'anthropic' | 'ollama';
  model?: string;
  voice_provider?: 'elevenlabs' | 'openai' | 'google';
  voice_id?: string;
  stt_provider?: 'deepgram' | 'whisper' | 'google';
  temperature?: number;
  max_tokens?: number;
  config?: Record<string, any>;
}

export interface UpdateAgentParams {
  name?: string;
  description?: string;
  system_prompt?: string;
  provider?: 'openai' | 'anthropic' | 'ollama';
  model?: string;
  voice_provider?: 'elevenlabs' | 'openai' | 'google';
  voice_id?: string;
  is_active?: boolean;
  config?: Record<string, any>;
}

export interface ListAgentsParams {
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

/**
 * Call types
 */

export interface Call {
  call_sid: string;
  agent_id: string;
  to_number: string;
  from_number?: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  direction: 'inbound' | 'outbound';
  duration?: number;
  start_time?: string;
  end_time?: string;
  recording_url?: string;
  transcript?: string;
  metadata?: Record<string, any>;
  created_at: string;
  agent_name?: string;
}

export interface CreateCallParams {
  agent_id: string;
  to_number: string;
  from_number?: string;
  metadata?: Record<string, any>;
}

export interface ListCallsParams {
  agent_id?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

/**
 * Campaign types
 */

export interface Campaign {
  id: string;
  name: string;
  agent_id?: string;
  agent_name?: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduled_time?: string;
  contacts: Array<{
    name?: string;
    phone: string;
    email?: string;
    metadata?: Record<string, any>;
  }>;
  total_contacts: number;
  completed_calls: number;
  successful_calls: number;
  failed_calls: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignParams {
  name: string;
  agent_id?: string;
  scheduled_time?: string;
  contacts?: Array<{
    name?: string;
    phone: string;
    email?: string;
    metadata?: Record<string, any>;
  }>;
}

export interface UpdateCampaignParams {
  name?: string;
  agent_id?: string;
  status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduled_time?: string;
}

/**
 * Knowledge Base types
 */

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'docx' | 'url';
  content?: string;
  url?: string;
  chunks_count: number;
  status: 'processing' | 'ready' | 'failed';
  tenant_id: string;
  created_at: string;
}

export interface UploadDocumentParams {
  name: string;
  file?: File | Buffer;
  content?: string;
  url?: string;
  type?: 'pdf' | 'txt' | 'docx' | 'url';
}

/**
 * Analytics types
 */

export interface DashboardStats {
  total_calls: number;
  active_agents: number;
  success_rate: string;
  avg_duration: string;
  calls_by_status: Record<string, number>;
}

export interface CallVolumeData {
  period: string;
  data: Array<{
    timestamp: string;
    count: number;
  }>;
}

/**
 * Integration types
 */

export interface Integration {
  id: string;
  name: string;
  type: 'twilio' | 'salesforce' | 'hubspot' | 'slack' | 'zapier' | 'webhook';
  config: Record<string, any>;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIntegrationParams {
  name: string;
  type: 'twilio' | 'salesforce' | 'hubspot' | 'slack' | 'zapier' | 'webhook';
  config: Record<string, any>;
}

/**
 * Phone Number types
 */

export interface PhoneNumber {
  id: string;
  phone_number: string;
  country_code: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
  is_active: boolean;
  tenant_id: string;
  created_at: string;
}

export interface SearchPhoneNumbersParams {
  country_code?: string;
  area_code?: string;
  contains?: string;
  limit?: number;
}

/**
 * API Key types
 */

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateApiKeyParams {
  name: string;
  permissions?: string[];
}

/**
 * Voice Cloning types
 */

export interface VoiceProfile {
  id: string;
  name: string;
  description?: string;
  voice_id: string;
  provider: 'elevenlabs' | 'openai';
  status: 'training' | 'ready' | 'failed';
  tenant_id: string;
  created_at: string;
}

export interface CreateVoiceProfileParams {
  name: string;
  description?: string;
  audio_files: File[] | Buffer[];
  provider?: 'elevenlabs' | 'openai';
}

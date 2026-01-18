import { AxiosRequestConfig } from 'axios';
import { VoiceProfile, CreateVoiceProfileParams } from '../types';

export class VoiceCloning {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Create a new voice profile
   * 
   * @example
   * const voice = await pollax.voiceCloning.create({
   *   name: 'Custom Voice',
   *   description: 'My custom voice profile',
   *   audio_files: [audioFile1, audioFile2],
   * });
   */
  async create(params: CreateVoiceProfileParams): Promise<VoiceProfile> {
    const formData = new FormData();
    formData.append('name', params.name);
    
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.provider) {
      formData.append('provider', params.provider);
    }

    params.audio_files.forEach((file, index) => {
      formData.append('audio_files', file, `audio_${index}.wav`);
    });

    return this.request<VoiceProfile>({
      method: 'POST',
      url: '/api/v1/voice-cloning',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * List all voice profiles
   * 
   * @example
   * const voices = await pollax.voiceCloning.list();
   */
  async list(): Promise<VoiceProfile[]> {
    return this.request<VoiceProfile[]>({
      method: 'GET',
      url: '/api/v1/voice-cloning',
    });
  }

  /**
   * Get a single voice profile by ID
   * 
   * @example
   * const voice = await pollax.voiceCloning.retrieve('voice_123');
   */
  async retrieve(voiceId: string): Promise<VoiceProfile> {
    return this.request<VoiceProfile>({
      method: 'GET',
      url: `/api/v1/voice-cloning/${voiceId}`,
    });
  }

  /**
   * Delete a voice profile
   * 
   * @example
   * await pollax.voiceCloning.delete('voice_123');
   */
  async delete(voiceId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/voice-cloning/${voiceId}`,
    });
  }
}

import { AxiosRequestConfig } from 'axios';
import { PhoneNumber, SearchPhoneNumbersParams } from '../types';

export class PhoneNumbers {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * List all phone numbers
   * 
   * @example
   * const numbers = await pollax.phoneNumbers.list();
   */
  async list(): Promise<PhoneNumber[]> {
    return this.request<PhoneNumber[]>({
      method: 'GET',
      url: '/api/v1/phone-numbers',
    });
  }

  /**
   * Search available phone numbers
   * 
   * @example
   * const numbers = await pollax.phoneNumbers.search({
   *   country_code: 'US',
   *   area_code: '415',
   * });
   */
  async search(params: SearchPhoneNumbersParams): Promise<PhoneNumber[]> {
    return this.request<PhoneNumber[]>({
      method: 'GET',
      url: '/api/v1/phone-numbers/search',
      params,
    });
  }

  /**
   * Purchase a phone number
   * 
   * @example
   * const number = await pollax.phoneNumbers.purchase('+14155551234');
   */
  async purchase(phoneNumber: string): Promise<PhoneNumber> {
    return this.request<PhoneNumber>({
      method: 'POST',
      url: '/api/v1/phone-numbers',
      data: { phone_number: phoneNumber },
    });
  }

  /**
   * Release a phone number
   * 
   * @example
   * await pollax.phoneNumbers.release('num_123');
   */
  async release(numberId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/phone-numbers/${numberId}`,
    });
  }
}

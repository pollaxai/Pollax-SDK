import { AxiosRequestConfig } from 'axios';
import {
  KnowledgeDocument,
  UploadDocumentParams,
} from '../types';

export class Knowledge {
  constructor(private request: <T = any>(config: AxiosRequestConfig) => Promise<T>) {}

  /**
   * Upload a document to the knowledge base
   * 
   * @example
   * const doc = await pollax.knowledge.upload({
   *   name: 'Product Manual',
   *   file: pdfFile,
   *   type: 'pdf',
   * });
   */
  async upload(params: UploadDocumentParams): Promise<KnowledgeDocument> {
    const formData = new FormData();
    formData.append('name', params.name);

    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.content) {
      formData.append('content', params.content);
    }
    if (params.url) {
      formData.append('url', params.url);
    }
    if (params.type) {
      formData.append('type', params.type);
    }

    return this.request<KnowledgeDocument>({
      method: 'POST',
      url: '/api/v1/knowledge',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * List all knowledge documents
   * 
   * @example
   * const documents = await pollax.knowledge.list();
   */
  async list(): Promise<KnowledgeDocument[]> {
    return this.request<KnowledgeDocument[]>({
      method: 'GET',
      url: '/api/v1/knowledge',
    });
  }

  /**
   * Get a single document by ID
   * 
   * @example
   * const doc = await pollax.knowledge.retrieve('doc_123');
   */
  async retrieve(documentId: string): Promise<KnowledgeDocument> {
    return this.request<KnowledgeDocument>({
      method: 'GET',
      url: `/api/v1/knowledge/${documentId}`,
    });
  }

  /**
   * Delete a document
   * 
   * @example
   * await pollax.knowledge.delete('doc_123');
   */
  async delete(documentId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/knowledge/${documentId}`,
    });
  }

  /**
   * Search the knowledge base
   * 
   * @example
   * const results = await pollax.knowledge.search({
   *   query: 'How do I reset my password?',
   *   limit: 5,
   * });
   */
  async search(params: { query: string; limit?: number }): Promise<{
    results: Array<{
      document_id: string;
      content: string;
      score: number;
    }>;
  }> {
    return this.request({
      method: 'POST',
      url: '/api/v1/knowledge/search',
      data: params,
    });
  }
}

/* eslint-disable no-console -- needed*/
import type { z } from 'zod';
import type {
  CountVectorsResponseSchema,
  CreateCollectionRequestSchema,
  CreateCollectionResponseSchema,
  DeleteVectorListRequestSchema,
  DeleteVectorListResponseSchema,
  DeletedCollectionResponseSchema,
  EmnoConfig,
  ErrorBody,
  GetAllCollectionResponseSchema,
  GetVectorListRequestSchema,
  QueryVectorListResponseSchema,
  QueryVectorListSchema,
  UpdateCollectionRequestSchema,
  VectorCreateListRequestSchema,
  VectorListResponseSchema,
  VectorListUpsertResponseSchema,
  VectorUpdateListRequestSchema,
} from './types/types';

const BASE_URL = 'https://apis.emno.io';

export class EmnoHttpClient {
  private baseUrl: string;

  private defaultFetchConfig: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  async makeAPICall<T>(
    urlPath: string,
    options: RequestInit
  ): Promise<{ responseData?: T; status: number; error?: ErrorBody }> {
    const URL = `${this.baseUrl}${urlPath}`;
    const response = await fetch(URL, {
      ...this.defaultFetchConfig,
      ...options,
    });
    if (!response.ok) {
      let errBody: ErrorBody;
      let errText = 'Unknown Error';
      try {
        errBody = (await response.json()) as ErrorBody;
      } catch (e) {
        try {
          errText = await response.text();
        } catch (e2) {
          console.log('Unable to parse error text');
        }
        errBody = { message: errText };
      }
      return {
        status: response.status,
        error: errBody,
      };
    }

    return {
      status: response.status,
      responseData: (await response.json()) as T,
    };
  }

  constructor(config: EmnoConfig) {
    this.baseUrl = config.baseUrl || BASE_URL;
    // this.client = axios.create({ baseURL: baseUrl });
    if (config.token) {
      this.defaultFetchConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.token}`,
        },
      };
    }
  }

  async createCollection(
    collectionInfo: z.infer<typeof CreateCollectionRequestSchema>
  ): Promise<z.infer<typeof CreateCollectionResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(collectionInfo),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >('/collections', requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async getCollection(
    collectionIdentifier: string
  ): Promise<z.infer<typeof CreateCollectionResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >(`/collections/${collectionIdentifier}`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async updateCollection(
    collectionId: string,
    data: z.infer<typeof UpdateCollectionRequestSchema>
  ): Promise<z.infer<typeof CreateCollectionResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >(`/collections/${collectionId}`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async deleteCollection(
    collectionIdentifier: string
  ): Promise<z.infer<typeof DeletedCollectionResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'DELETE',
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof DeletedCollectionResponseSchema>
    >(`/collections/${collectionIdentifier}`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async listCollections(): Promise<
    z.infer<typeof GetAllCollectionResponseSchema> | undefined
  > {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof GetAllCollectionResponseSchema>
    >(`/collections`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  /// ---- Vector Operations ----

  async count(
    collectionId: string
  ): Promise<z.infer<typeof CountVectorsResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof CountVectorsResponseSchema>
    >(`/collections/${collectionId}/vectors/count`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async getVectors(
    collectionId: string,
    data: z.infer<typeof GetVectorListRequestSchema>
  ): Promise<z.infer<typeof VectorListResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof VectorListResponseSchema>
    >(`/collections/${collectionId}/vectors/get`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async listVectors(
    collectionId: string,
    includeVectorValues = false
  ): Promise<z.infer<typeof VectorListResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ includeVectorValues }),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof VectorListResponseSchema>
    >(`/collections/${collectionId}/vectors/getAll`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async addVectors(
    collectionId: string,
    data: z.infer<typeof VectorCreateListRequestSchema>
  ): Promise<z.infer<typeof VectorListResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof VectorListResponseSchema>
    >(`/collections/${collectionId}/vectors/create`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async updateVectors(
    collectionId: string,
    data: z.infer<typeof VectorUpdateListRequestSchema>
  ): Promise<z.infer<typeof VectorListUpsertResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof VectorListUpsertResponseSchema>
    >(`/collections/${collectionId}/vectors/update`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async deleteVectors(
    collectionId: string,
    data: z.infer<typeof DeleteVectorListRequestSchema>
  ): Promise<z.infer<typeof DeleteVectorListResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof DeleteVectorListResponseSchema>
    >(`/collections/${collectionId}/vectors/delete`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }

  async query(
    collectionId: string,
    query: z.infer<typeof QueryVectorListSchema>
  ): Promise<z.infer<typeof QueryVectorListResponseSchema> | undefined> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(query),
    };
    const { error, responseData, status } = await this.makeAPICall<
      z.infer<typeof QueryVectorListResponseSchema>
    >(`/collections/${collectionId}/query`, requestOptions);
    if (error) {
      console.log(`${status}: ${error.message}`);
      return undefined;
    }
    return responseData;
  }
}

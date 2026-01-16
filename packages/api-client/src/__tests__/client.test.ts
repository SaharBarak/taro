/**
 * Client Tests
 *
 * Tests for the base API client including initialization,
 * HTTP methods, error handling, and authentication.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ApiClient,
  ApiError,
  initializeApiClient,
  getApiClient,
  type ApiClientConfig,
} from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  const baseUrl = 'https://api.test.com';
  let client: ApiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new ApiClient({ baseUrl });
  });

  describe('constructor', () => {
    it('should create client with base URL', () => {
      const testClient = new ApiClient({ baseUrl: 'https://example.com' });
      expect(testClient).toBeInstanceOf(ApiClient);
    });

    it('should create client with token getter', () => {
      const testClient = new ApiClient({
        baseUrl: 'https://example.com',
        getToken: async () => 'test-token',
      });
      expect(testClient).toBeInstanceOf(ApiClient);
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = { data: 'test' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
    });

    it('should make GET request', async () => {
      const result = await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request with body', async () => {
      const body = { name: 'test' };
      const result = await client.post('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request without body', async () => {
      const result = await client.post('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'POST',
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT request', async () => {
      const body = { name: 'test' };
      const result = await client.put('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make PATCH request', async () => {
      const body = { name: 'test' };
      const result = await client.patch('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE request', async () => {
      const result = await client.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('authentication', () => {
    it('should include Authorization header when token is provided', async () => {
      const clientWithToken = new ApiClient({
        baseUrl,
        getToken: async () => 'test-token-123',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await clientWithToken.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-123',
        },
      });
    });

    it('should not include Authorization header when token is null', async () => {
      const clientWithToken = new ApiClient({
        baseUrl,
        getToken: async () => null,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await clientWithToken.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should not include Authorization header when no getToken provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw ApiError on non-2xx response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request', code: 'BAD_REQUEST' }),
      });

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });

    it('should include status code in ApiError', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
      }
    });

    it('should include error code in ApiError when available', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' }),
      });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('INSUFFICIENT_PERMISSIONS');
      }
    });

    it('should use default message when JSON parsing fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('An error occurred');
        expect((error as ApiError).status).toBe(500);
      }
    });

    it('should handle 401 Unauthorized', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized', code: 'UNAUTHORIZED' }),
      });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(401);
        expect((error as ApiError).code).toBe('UNAUTHORIZED');
      }
    });

    it('should handle 429 Rate Limited', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests', code: 'RATE_LIMITED' }),
      });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(429);
        expect((error as ApiError).code).toBe('RATE_LIMITED');
      }
    });
  });
});

describe('ApiError', () => {
  it('should create error with message and status', () => {
    const error = new ApiError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.code).toBeUndefined();
    expect(error.name).toBe('ApiError');
  });

  it('should create error with message, status, and code', () => {
    const error = new ApiError('Test error', 400, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
  });

  it('should be an instance of Error', () => {
    const error = new ApiError('Test error', 400);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('Singleton management', () => {
  // Reset singleton state between tests
  beforeEach(() => {
    // Access internal state to reset (this is a test-only pattern)
    // In the actual implementation, we rely on the module being fresh
  });

  describe('initializeApiClient', () => {
    it('should initialize the API client', () => {
      initializeApiClient({
        baseUrl: 'https://api.test.com',
      });

      // Should not throw
      const client = getApiClient();
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should accept getToken callback', () => {
      initializeApiClient({
        baseUrl: 'https://api.test.com',
        getToken: async () => 'token',
      });

      expect(getApiClient()).toBeInstanceOf(ApiClient);
    });
  });

  describe('getApiClient', () => {
    it('should return initialized client', () => {
      initializeApiClient({ baseUrl: 'https://api.test.com' });
      const client = getApiClient();
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should return same instance on multiple calls', () => {
      initializeApiClient({ baseUrl: 'https://api.test.com' });
      const client1 = getApiClient();
      const client2 = getApiClient();
      expect(client1).toBe(client2);
    });
  });
});

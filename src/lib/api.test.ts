import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    api.setToken(null);
  });

  it('manages authorization token correctly', () => {
    api.setToken('test-jwt-token');
    // Global fetch mock
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
    global.fetch = fetchMock;

    return api.get('/test-endpoint').then((data) => {
      expect(data).toEqual({ status: 'ok' });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-jwt-token',
          }),
        })
      );
    });
  });

  it('handles API error response by throwing formatted Error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'Invalid payload' } }),
    });
    global.fetch = fetchMock;

    await expect(api.post('/fail-endpoint', { foo: 'bar' })).rejects.toThrow(
      'Invalid payload'
    );
  });
});

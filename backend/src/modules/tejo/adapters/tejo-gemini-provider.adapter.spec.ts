import axios from 'axios';
import { TejoGeminiProviderAdapter } from './tejo-gemini-provider.adapter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TejoGeminiProviderAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when API key is missing', async () => {
    const settingsService = {
      getGeminiApiKey: jest.fn().mockResolvedValue(''),
      getGeminiBaseUrl: jest.fn().mockResolvedValue('https://generativelanguage.googleapis.com/v1beta'),
      getGeminiChatModel: jest.fn().mockResolvedValue('gemini-2.0-flash'),
      getGeminiEmbeddingModel: jest.fn().mockResolvedValue('text-embedding-004'),
    };

    const adapter = new TejoGeminiProviderAdapter(settingsService as any);

    await expect(
      adapter.chat({
        locale: 'en',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    ).rejects.toThrow('Gemini API key is missing');
  });

  it('returns generated text from Gemini response', async () => {
    const settingsService = {
      getGeminiApiKey: jest.fn().mockResolvedValue('test-api-key'),
      getGeminiBaseUrl: jest.fn().mockResolvedValue('https://generativelanguage.googleapis.com/v1beta'),
      getGeminiChatModel: jest.fn().mockResolvedValue('gemini-2.0-flash'),
      getGeminiEmbeddingModel: jest.fn().mockResolvedValue('text-embedding-004'),
    };

    mockedAxios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Gemini reply' }],
            },
          },
        ],
      },
    } as any);

    const adapter = new TejoGeminiProviderAdapter(settingsService as any);

    const result = await adapter.chat({
      locale: 'en',
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(result.outputText).toBe('Gemini reply');
    expect(result.model).toBe('gemini-2.0-flash');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
});

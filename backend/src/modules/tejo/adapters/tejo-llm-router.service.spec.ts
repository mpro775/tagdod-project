import { TejoLlmRouterService } from './tejo-llm-router.service';

describe('TejoLlmRouterService', () => {
  const createProvider = (name: string) => ({
    name,
    healthCheck: jest.fn(),
    chat: jest.fn(),
    embed: jest.fn(),
  });

  it('uses configured provider order and skips unhealthy providers', async () => {
    const gemini = createProvider('gemini');
    const primary = createProvider('provider-a');
    const fallback = createProvider('provider-b');

    gemini.healthCheck.mockResolvedValue(false);
    primary.healthCheck.mockResolvedValue(true);
    primary.chat.mockResolvedValue({ outputText: 'ok', confidence: 0.7, model: 'provider-a-chat' });

    const systemSettingsService = {
      getSettingValue: jest.fn().mockResolvedValue(['gemini', 'provider-a', 'provider-b']),
    };

    const service = new TejoLlmRouterService(
      gemini as any,
      primary as any,
      fallback as any,
      systemSettingsService as any,
    );

    const result = await service.chat({
      locale: 'ar',
      messages: [{ role: 'user', content: 'مرحبا' }],
    });

    expect(result.provider).toBe('provider-a');
    expect(gemini.chat).not.toHaveBeenCalled();
    expect(primary.chat).toHaveBeenCalledTimes(1);
  });

  it('falls back when a provider throws in chat', async () => {
    const gemini = createProvider('gemini');
    const primary = createProvider('provider-a');
    const fallback = createProvider('provider-b');

    gemini.healthCheck.mockResolvedValue(true);
    gemini.chat.mockRejectedValue(new Error('network failed'));
    primary.healthCheck.mockResolvedValue(true);
    primary.chat.mockResolvedValue({ outputText: 'fallback', confidence: 0.62, model: 'provider-a' });

    const systemSettingsService = {
      getSettingValue: jest.fn().mockResolvedValue(['gemini', 'provider-a']),
    };

    const service = new TejoLlmRouterService(
      gemini as any,
      primary as any,
      fallback as any,
      systemSettingsService as any,
    );

    const result = await service.chat({
      locale: 'en',
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(result.provider).toBe('provider-a');
    expect(gemini.chat).toHaveBeenCalledTimes(1);
    expect(primary.chat).toHaveBeenCalledTimes(1);
  });
});

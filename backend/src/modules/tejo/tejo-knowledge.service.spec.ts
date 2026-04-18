import { TejoKnowledgeService } from './tejo-knowledge.service';

describe('TejoKnowledgeService', () => {
  const createService = () => {
    const kbModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };

    const llmRouterService = {
      embed: jest.fn(),
    };

    const service = new TejoKnowledgeService(kbModel as any, llmRouterService as any);
    return { service, kbModel, llmRouterService };
  };

  it('creates knowledge entry with embedding vector', async () => {
    const { service, kbModel, llmRouterService } = createService();

    kbModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    llmRouterService.embed.mockResolvedValue({
      response: { model: 'text-embedding-004', vectors: [[0.1, 0.2, 0.3]] },
      provider: 'gemini',
    });
    kbModel.create.mockResolvedValue({ key: 'faq_1' });

    await service.createKnowledge(
      { key: 'faq_1', text: 'sample faq text', locale: 'ar' },
      'admin-1',
    );

    expect(llmRouterService.embed).toHaveBeenCalledWith({ texts: ['sample faq text'] });
    expect(kbModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'faq_1',
        text: 'sample faq text',
        vector: [0.1, 0.2, 0.3],
        model: 'text-embedding-004',
      }),
    );
  });

  it('updates knowledge text and vector', async () => {
    const { service, kbModel, llmRouterService } = createService();

    const save = jest.fn().mockResolvedValue(undefined);
    kbModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        key: 'faq_1',
        text: 'old text',
        vector: [0.01],
        model: 'old-model',
        locale: 'ar',
        metadata: {},
        set: jest.fn(function assignValue(field: string, value: unknown) {
          (this as any)[field] = value;
        }),
        save,
      }),
    });

    llmRouterService.embed.mockResolvedValue({
      response: { model: 'text-embedding-004', vectors: [[0.9, 0.8]] },
      provider: 'gemini',
    });

    const result = await service.updateKnowledge('faq_1', { text: 'new text' }, 'admin-1');

    expect(result.text).toBe('new text');
    expect(result.vector).toEqual([0.9, 0.8]);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

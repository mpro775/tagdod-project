import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { SupportModule } from '../support/support.module';
import { SearchModule } from '../search/search.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { TejoController } from './tejo.controller';
import { TejoAdminController } from './tejo.admin.controller';
import { TejoService } from './tejo.service';
import { TejoPromptService } from './tejo-prompt.service';
import { TejoAnalyticsService } from './tejo-analytics.service';
import { TejoSettingsService } from './tejo-settings.service';
import { TejoLlmRouterService } from './adapters/tejo-llm-router.service';
import { TejoGeminiProviderAdapter } from './adapters/tejo-gemini-provider.adapter';
import { TejoPrimaryProviderAdapter } from './adapters/tejo-primary-provider.adapter';
import { TejoFallbackProviderAdapter } from './adapters/tejo-fallback-provider.adapter';
import {
  TejoPrompt,
  TejoPromptSchema,
} from './schemas/tejo-prompt.schema';
import {
  TejoConversation,
  TejoConversationSchema,
} from './schemas/tejo-conversation.schema';
import {
  TejoProductEmbedding,
  TejoProductEmbeddingSchema,
} from './schemas/tejo-product-embedding.schema';
import {
  TejoKbEmbedding,
  TejoKbEmbeddingSchema,
} from './schemas/tejo-kb-embedding.schema';
import { TEJO_EMBEDDINGS_QUEUE } from './queue/tejo-queue.constants';
import { TejoQueueService } from './queue/tejo-queue.service';
import { TejoQueueProcessor } from './queue/tejo-queue.processor';
import { TejoKnowledgeService } from './tejo-knowledge.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: TejoPrompt.name, schema: TejoPromptSchema },
      { name: TejoConversation.name, schema: TejoConversationSchema },
      { name: TejoProductEmbedding.name, schema: TejoProductEmbeddingSchema },
      { name: TejoKbEmbedding.name, schema: TejoKbEmbeddingSchema },
    ]),
    BullModule.registerQueue({
      name: TEJO_EMBEDDINGS_QUEUE,
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    }),
    AuthModule,
    SharedModule,
    forwardRef(() => SupportModule),
    SearchModule,
    forwardRef(() => SystemSettingsModule),
  ],
  controllers: [TejoController, TejoAdminController],
  providers: [
    TejoService,
    TejoPromptService,
    TejoAnalyticsService,
    TejoSettingsService,
    TejoKnowledgeService,
    TejoLlmRouterService,
    TejoGeminiProviderAdapter,
    TejoPrimaryProviderAdapter,
    TejoFallbackProviderAdapter,
    TejoQueueService,
    TejoQueueProcessor,
  ],
  exports: [
    TejoService,
    TejoPromptService,
    TejoAnalyticsService,
    TejoSettingsService,
    TejoKnowledgeService,
  ],
})
export class TejoModule {}


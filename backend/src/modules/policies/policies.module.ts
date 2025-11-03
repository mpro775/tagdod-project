import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoliciesService } from './policies.service';
import { PoliciesAdminController } from './policies.admin.controller';
import { PoliciesPublicController } from './policies.public.controller';
import { Policy, PolicySchema } from './schemas/policy.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Policy.name, schema: PolicySchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [PoliciesAdminController, PoliciesPublicController],
  providers: [PoliciesService],
  exports: [PoliciesService, MongooseModule],
})
export class PoliciesModule {}

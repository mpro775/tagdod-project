import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Capabilities, CapabilitiesSchema } from './schemas/capabilities.schema';
import { SharedModule } from '../../shared/shared.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Capabilities.name, schema: CapabilitiesSchema }]),
    SharedModule,
  ],
  exports: [MongooseModule],
})
export class CapabilitiesModule {}

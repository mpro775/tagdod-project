import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Capabilities, CapabilitiesSchema } from './schemas/capabilities.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Capabilities.name, schema: CapabilitiesSchema }])],
  exports: [MongooseModule],
})
export class CapabilitiesModule {}

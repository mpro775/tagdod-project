import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttributesService } from './attributes.service';
import { AttributesAdminController } from './attributes.admin.controller';
import { AttributesPublicController } from './attributes.public.controller';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { AttributeValue, AttributeValueSchema } from './schemas/attribute-value.schema';
import { AttributeGroup, AttributeGroupSchema } from './schemas/attribute-group.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TokensService } from '../auth/tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attribute.name, schema: AttributeSchema },
      { name: AttributeValue.name, schema: AttributeValueSchema },
      { name: AttributeGroup.name, schema: AttributeGroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AttributesAdminController, AttributesPublicController],
  providers: [AttributesService, TokensService],
  exports: [AttributesService, MongooseModule],
})
export class AttributesModule {}


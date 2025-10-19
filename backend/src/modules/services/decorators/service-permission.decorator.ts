import { SetMetadata } from '@nestjs/common';
import { ServicePermission } from '../guards/services-permission.guard';

export const RequireServicePermission = (permission: ServicePermission) =>
  SetMetadata('servicePermission', permission);

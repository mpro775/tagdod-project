import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RequestUser {
  sub: string;
  phone: string;
  isAdmin?: boolean;
  role?: string;
  isEngineer?: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

export enum ServicePermission {
  CUSTOMER = 'customer',
  ENGINEER = 'engineer',
  ADMIN = 'admin',
}

@Injectable()
export class ServicesPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<ServicePermission>(
      'servicePermission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check user role based on required permission
    switch (requiredPermission) {
      case ServicePermission.CUSTOMER:
        // All authenticated users can be customers
        return true;

      case ServicePermission.ENGINEER:
        // Check if user has engineer role or is verified engineer
        return user.role === 'engineer' || user.isEngineer === true;

      case ServicePermission.ADMIN:
        // Check if user has admin role
        return user.role === 'admin' || user.isAdmin === true;

      default:
        return false;
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_DOCTOR, ROLE_PATIENT } from '../constants/roles';

const ROLE_HIERARCHY: Record<string, string[]> = {
  [ROLE_DOCTOR]: [ROLE_DOCTOR, ROLE_PATIENT],
  [ROLE_PATIENT]: [ROLE_PATIENT],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole as string | undefined;

    if (!userRole) {
      throw new UnauthorizedException(
        'Authenticated user has no assigned role. Ensure AuthGuard runs before RolesGuard.',
      );
    }

    // Get all roles the user effectively has (including inherited ones)
    const effectiveRoles = ROLE_HIERARCHY[userRole] ?? [userRole];

    const hasAccess = requiredRoles.some(role => effectiveRoles.includes(role));

    if (!hasAccess) {
      throw new ForbiddenException(
        `Role "${userRole}" is not authorized. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

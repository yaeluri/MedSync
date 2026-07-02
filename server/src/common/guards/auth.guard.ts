import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALL_ROLES } from '../constants/roles';
import { IRole } from '../../entities';

interface AuthTokenPayload {
  sub?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!bearer || typeof bearer !== 'string' || !bearer.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = bearer.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    let payload: AuthTokenPayload;
    try {
      payload = this.jwtService.verify<AuthTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = payload?.sub;
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findUserByIdWithRole(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const roleName: IRole['name'] = user.role?.name;

    if (!roleName || !(ALL_ROLES).includes(roleName)) {
      throw new ForbiddenException(
        'User does not have an assigned role. Contact an administrator.',
      );
    }

    request.user = user;
    request.userRole = roleName;

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALL_ROLES } from '../constants/roles';
import { IRole } from 'src/entities';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
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

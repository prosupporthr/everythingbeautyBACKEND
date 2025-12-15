import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { User, UserDocument } from '@/schemas/User.schema';
import { Admin, AdminDocument } from '@/schemas/Admin.schema';
import {
  AUTH_TYPE_KEY,
  UserType,
} from '@/common/decorators/auth-type/auth-type.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        email: string;
        role?: string;
      }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Determine user type from header, default to USER
      const headerUserType = request.headers['user-type'] as string;
      const userType =
        headerUserType === 'ADMIN' ? UserType.ADMIN : UserType.USER;

      // Check for decorator restrictions
      const requiredTypes = this.reflector.getAllAndOverride<UserType[]>(
        AUTH_TYPE_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredTypes && !requiredTypes.includes(userType)) {
        throw new ForbiddenException(
          `Access denied for user type: ${userType}`,
        );
      }

      if (userType === UserType.ADMIN) {
        const admin = await this.adminModel.findById(payload.id);
        if (!admin) {
          throw new UnauthorizedException('Admin not found');
        }
        if (admin.isDeleted || admin.suspended) {
          throw new ForbiddenException('Admin account is suspended or deleted');
        }
        request['user'] = admin;
      } else {
        const user = await this.userModel.findById(payload.id);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
        if (user.isDeleted || user.isSuspended) {
          throw new ForbiddenException('User account is suspended or deleted');
        }
        request['user'] = user;
      }
    } catch (error) {
      this.logger.error(error);
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid token or unauthorized access');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

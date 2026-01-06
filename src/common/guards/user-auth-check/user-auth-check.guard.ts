import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/schemas/User.schema';

@Injectable()
export class UserAuthCheckGuard implements CanActivate {
  private logger = new Logger(UserAuthCheckGuard.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      req['user'] = null;
      return true;
    }

    if (typeof authHeader !== 'string') {
      req['user'] = null;
      return true;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      req['user'] = null;
      return true;
    }

    try {
      const verifiedToken: { id: string; email: string } =
        await this.jwtService.verifyAsync(token, {
          algorithms: ['HS256'],
          secret: this.configService.get('JWT_SECRET'),
        });

      const user = await this.userModel.findById(verifiedToken.id);
      if (!user || user.isDeleted || user.isSuspended) {
        req['user'] = null;
        return true;
      }

      req['user'] = user;
      return true;
    } catch {
      this.logger.debug('Optional auth check failed, continuing without user');
      req['user'] = null;
      return true;
    }
  }
}

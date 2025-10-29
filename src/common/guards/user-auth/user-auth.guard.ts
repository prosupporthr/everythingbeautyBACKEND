import { User, UserDocument } from '@/schemas/User.schema';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

@Injectable()
export class UserAuthGuard implements CanActivate {
  private logger = new Logger(UserAuthGuard.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader: string = req.headers['authorization'] as string;

    if (!authHeader) {
      throw new UnauthorizedException(
        'Your are not authorized to carry out this action auth header',
      );
    }

    // get the token
    const [bearer, token] = authHeader.split(' ');
    if (!bearer || !token)
      throw new UnauthorizedException(
        'Your are not authorized to carry out this action bearer',
      );

    // verify token
    const verifiedToken: { id: string; email: string } =
      await this.jwtService.verifyAsync(token, {
        algorithms: ['HS256'],
        secret: this.configService.get('JWT_SECRET'),
      });

    // get user from db
    const user = await this.userModel.findById(verifiedToken.id);
    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException(
        'Your are not authorized to carry out this action',
      );
    }

    // check if user is deleted
    if (user.isDeleted || user.isSuspended) {
      this.logger.error('This account has been deleted or suspended');
      throw new UnauthorizedException(
        'Your are not authorized to carry out this action, contact support',
      );
    }

    // add user to request
    req['user'] = user;
    return true;
  }
}

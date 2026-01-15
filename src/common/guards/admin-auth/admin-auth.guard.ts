import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '@/schemas/Admin.schema';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private logger = new Logger(AdminAuthGuard.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader: string = req.headers['authorization'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('Admin authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid admin authorization header');
    }

    try {
      const verifiedToken: { id: string; email: string; role?: string } =
        await this.jwtService.verifyAsync(token, {
          algorithms: ['HS256'],
          secret: this.configService.get('JWT_SECRET'),
        });

      const admin = await this.adminModel.findById(verifiedToken.id);
      if (!admin) {
        this.logger.error('Admin not found');
        throw new UnauthorizedException('Admin not found');
      }

      if (admin.isDeleted || admin.suspended) {
        this.logger.error('Admin account is deleted or suspended');
        throw new ForbiddenException('Admin account is not active');
      }

      req['user'] = admin;
      return true;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid admin token');
    }
  }
}

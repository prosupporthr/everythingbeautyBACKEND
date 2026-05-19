import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from '@/schemas/Post.schema';
import { Comment, CommentSchema } from '@/schemas/Comments.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { UploadService } from '../upload/upload.service';
import { PostGateway } from './post.gateway';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { UserService } from '../user/user.service';
import { OtpService } from '@/common/services/otp/otp.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Otp, OtpSchema } from '@/schemas/Otp.schema';
import { EmailService } from '@/common/services/email/email.service';
import { Notification, NotificationSchema } from '@/schemas/Notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, UploadService, JwtService, PostGateway, UserService, OtpService, NotificationsService, EmailService],
})
export class PostModule {}

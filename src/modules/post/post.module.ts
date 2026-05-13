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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, UploadService, JwtService, PostGateway],
})
export class PostModule {}

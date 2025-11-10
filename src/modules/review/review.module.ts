import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review, ReviewSchema } from '@/schemas/Review.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { User, UserSchema } from '@/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, JwtService],
})
export class ReviewModule {}

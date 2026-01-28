import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { User, UserSchema } from '@/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, ConfigService, JwtService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

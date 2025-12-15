/* eslint-disable @typescript-eslint/require-await */
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './modules/user/user.module';
import { BusinessModule } from './modules/business/business.module';
import { JwtModule } from '@nestjs/jwt';
import { ServiceModule } from './modules/service/service.module';
import { ProductModule } from './modules/product/product.module';
import { UploadModule } from './modules/upload/upload.module';
import { BookingModule } from './modules/booking/booking.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { AdminModule } from './modules/admin/admin.module';

const logger = new Logger('AppModule');
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'secret',
        expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d',
        global: true,
        verifyOptions: {
          ignoreExpiration: false,
          algorithms: ['HS256'],
        },
        signOptions: {
          algorithm: 'HS256',
          secretOrPrivateKey: config.get<string>('JWT_SECRET') || 'secret',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('DATABASE_URL') ||
          'mongodb://localhost:27017',
        appName: 'EVERYTHING_BEautiful',
        autoIndex: true,
        onConnectionCreate: (connection) => {
          connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
          });
          connection.on('connected', () => {
            logger.debug('MongoDB connected successfully');
          });
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    HttpModule,
    UserModule,
    BusinessModule,
    ServiceModule,
    ProductModule,
    UploadModule,
    BookingModule,
    OrderModule,
    ReviewModule,
    HttpModule.register({
      global: true,
      timeout: 5000,
      maxRedirects: 5,
    }),
    BookmarksModule,
    MessagingModule,
    TransactionsModule,
    AdminAuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

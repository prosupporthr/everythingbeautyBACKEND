import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(morgan('common'));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get<number>('PORT', 8001);

  const config = new DocumentBuilder()
    .setTitle('Everything Beautiful API')
    .setDescription('The Everything Beautiful API description')
    .setVersion('1.0')
    .addTag('everything-beautiful')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);
  await app
    .listen(PORT as number)
    .then(() => logger.debug(`Server is running on port ${PORT}`));
}
bootstrap();

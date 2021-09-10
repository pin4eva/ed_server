import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieSession from 'express-session';
import * as passport from 'passport';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import config from './utils/config';
import MongoStore = require('connect-mongo');
// import { RedisIoAdapter } from './utils/redis.io';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    logger: true,
  });
  const swaqqgerConfig = new DocumentBuilder()
    .setTitle('Edfhr Api')
    .setDescription('The EDFHR API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaqqgerConfig);

  SwaggerModule.setup('api/v3/doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  if (!process.env.DOCKER) {
    app.enableCors({
      origin: [
        'https://edfhr.org',
        'http://edfhr.org',
        'https://team.edfhr.org',
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
    });
  }

  // app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.use(cookieParser());
  app.use(
    cookieSession({
      secret: config.SECRET,
      name: '__ed',
      saveUninitialized: false,
      resave: false,
      store: MongoStore.create({
        mongoUrl: config.MONGO_URI,
        ttl: 2 * 24 * 60 * 60,
        autoRemove: 'native',
        // mongoOptions: mongooseOption,
      }),
    }),
  );
  const PORT = process.env.PORT || 5000;
  app.use(express.json({ limit: '50mb' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'public/views'));
  app.setViewEngine('hbs');
  // app.setGlobalPrefix('api/v3');
  await app.listen(PORT, () => {
    console.log(`process.env.DOCKER: ${process.env?.DOCKER?.toString()}`);
    Logger.log(`server started on port ${PORT}`);
  });
}
bootstrap();

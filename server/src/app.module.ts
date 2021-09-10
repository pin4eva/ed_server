import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicantModule } from './applicant/applicant.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
import config from './utils/config';

// const redis = new redisStore()

@Module({
  imports: [
    ApplicantModule,
    MongooseModule.forRoot(config.MONGO_URI, {
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
      // connectionFactory: (connection: Connection) => {
      //   connection.useDb('test');

      //   console.log(connection);
      //   return connection;
      // },
    }),

    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      installSubscriptionHandlers: true,
      path: '/api/v3/graphql',
      cors: false,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ ttl: 500 }),

    AuthModule,
    UserModule,
    ApplicantModule,
    CampaignModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
})
export class AppModule {}

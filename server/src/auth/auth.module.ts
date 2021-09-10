import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {
  Applicant,
  ApplicantSchema,
} from 'src/applicant/schema/applicant.shema';
import { User, UserSchema } from 'src/user/entity/user.schema';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './passport/google.strategy';
import { LocalStrategy, SessionSerializer } from './passport/local.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
    PassportModule.register({
      session: true,
    }),
    CacheModule.register(),
  ],
  providers: [
    AuthResolver,
    AuthService,
    SessionSerializer,
    LocalStrategy,
    UserService,
    GoogleStrategy,
    // ApplicantService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

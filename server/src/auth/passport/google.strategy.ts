import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { UserDocument } from 'src/user/entity/user.schema';
import config from 'src/utils/config';
import { AuthService } from '../auth.service';

const options: StrategyOptions = {
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8001/api/v3/auth/google/redirect',
  scope: ['email', 'profile'],
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails, photos, id } = profile;
    const data = {
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      googleId: id,
      image: photos?.[0]?.value,
    };
    const user = await this.authService.registerWithGoogle(
      data as UserDocument,
    );
    return user;
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { ReqWithUser } from 'src/typings';
import {
  ChangePasswordDTO,
  LoginWithEmailDTO,
  RegisterWithEmailDTO,
} from 'src/user/dto/user.dto';
import config, { CLIENT_URL } from 'src/utils/config';
import { AuthService } from './auth.service';
import { LoginGuard, RestAuthGuard } from './guards/local.guard';
import { SessionSerializer } from './passport/local.strategy';

@Controller('api/v3/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passportSerializer: SessionSerializer,
  ) {}
  @Get()
  home() {
    return 'Welcome to auth';
  }

  @Get('me')
  @UseGuards(RestAuthGuard)
  me(@Req() req: ReqWithUser) {
    const user = req.user;

    return this.authService.getMe(user);
  }

  @UseGuards(LoginGuard)
  @Post('login')
  @ApiParam({
    type: LoginWithEmailDTO,
    name: 'login',
  })
  async login(
    // @Body() data: LoginWithEmailDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: ReqWithUser,
  ) {
    const user = req.user;
    const token = sign(user?.id, config.SECRET);
    res.cookie('token', token, { secure: true });

    return user;
  }

  @Post('register')
  async register(@Body() data: RegisterWithEmailDTO) {
    const user = await this.authService.registerWithEmail(data);

    return user.id;
  }
  @Post('register-google')
  async registerWithGoogle(@Body() data: any) {
    const user = await this.authService.registerWithGoogle(data);

    return user.id;
  }
  // @UseGuards(LoginGuard)
  @Post('login-google')
  async loginWithGoogle(
    @Body() data: { googleId: string; email: string },
    @Req() req: ReqWithUser,
    @Res() res: Response,
  ) {
    // const user = await this.authService.loginWithGmail(data);

    // // const token = sign(user?.id, config.SECRET);
    // req.passport = {
    //   user,
    // };
    // res.cookie('token', token, { secure: true });

    return req?.user?.id;
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async google(@Req() req: ReqWithUser) {
    return req.user;
  }
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @Redirect(`${CLIENT_URL}/mycamp`, 302)
  async googleRedirect(@Req() req: ReqWithUser) {
    console.log(req.user);
    return req.user;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.logOut();
    res.clearCookie('__ed');
    res.clearCookie('token');
    return 'Okay';
  }
  @Post('forgot-password')
  async forgotPassword(@Body() data: { email: string }) {
    const user = await this.authService.forgotPassword(data.email);
    return user?.id;
  }
  @Post('verify-token')
  async verifyToken(@Body() data: { token: string }) {
    const user = await this.authService.verifyToken(data.token);
    return user?.id;
  }
  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDTO) {
    const user = await this.authService.changePassword(data);
    return { id: user.id, email: user.email };
  }
}

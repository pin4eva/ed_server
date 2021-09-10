import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    return;
    // return this.appService.getHello();
  }

  @Get('api/v3')
  renderV3() {
    return `<h1>Welcome to V3</h1>`;
  }
}

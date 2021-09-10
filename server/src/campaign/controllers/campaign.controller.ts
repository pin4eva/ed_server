import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { RestAuthGuard } from 'src/auth/guards/local.guard';
import { NotificationService } from 'src/notification/notification.service';
import { ReqWithUser } from 'src/typings';
import { CreateCampaignDTO, UpdateCampaignDTO } from '../dto/campaign.dto';
import { CampaignGateway } from '../gateway/campaign.gateway';
import { CampaignService } from '../services/campaign.service';

@Controller('api/v3/campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly campaignGateway: CampaignGateway,
  ) {}
  @UseGuards(RestAuthGuard)
  @Post()
  create(@Body() data: CreateCampaignDTO, @Req() req: ReqWithUser) {
    return this.campaignService.create(data, req.user);
  }
  // @Get('notice')
  // getAllnotice() {
  //   console.log('hello from controller');
  //   return this.campaignService.findAllNotice();
  // }

  @Get()
  findAll() {
    return this.campaignService.findAll();
  }
  @Get('notice')
  findAllNotice(@Query('model') model: string) {
    return this.campaignService.findAllNotice(model);
  }
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.campaignService.findOne(slug);
  }
  @UseGuards(RestAuthGuard)
  @Get('mycampaign')
  async myCampaign(@Req() req: ReqWithUser) {
    return this.campaignService.myCampaigns(req?.user?.id);
  }
  @Put()
  update(@Body() data: UpdateCampaignDTO) {
    return this.campaignService.update(data);
  }
  @UseGuards(RestAuthGuard)
  @Delete('/single/:id')
  async delete(@Param('id') id: string) {
    const campaign = await this.campaignService.delete(id);
    return campaign.id;
  }
  @UseGuards(RestAuthGuard)
  @Post('like')
  async like(@Body('id') id: string, @Req() req: ReqWithUser) {
    return await this.campaignService.like(id, req.user);
  }
  @Post('approve')
  async approveCampaign(@Body() data: { campaign_id: string }) {
    return await this.campaignService.approveCampaign(data.campaign_id);
  }
}

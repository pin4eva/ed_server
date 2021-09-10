import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, GQLGuard } from 'src/auth/guards/graphql.guard';
import { ReqWithUser } from 'src/typings';
import { IUser } from 'src/user/dto/user.dto';
import { UserDocument } from 'src/user/entity/user.schema';
import { CampaignService } from '../services/campaign.service';
import { EndorsementService } from '../services/endorsement.service';

@Resolver('Campaign')
export class CampaignResolver {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly endorsementService: EndorsementService,
  ) {}
  @UseGuards(GQLGuard)
  @Query()
  async myCampaign(@CurrentUser() user: UserDocument) {
    return await this.campaignService.myCampaigns(user?.id);
  }
  @Query()
  async getCampaigns(@Args('limit') limit: number) {
    return await this.campaignService.findAll(limit);
  }
  @Query()
  async getCampaign(@Args('slug') slug: string) {
    return await this.campaignService.findOne(slug);
  }
  @Mutation()
  async deleteCampaign(@Args('id') id: string) {
    return await this.campaignService.delete(id);
  }
}

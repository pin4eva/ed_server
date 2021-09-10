import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice, NoticeDocument } from 'src/notification/notification.schema';
import { UserDocument } from 'src/user/entity/user.schema';
import { cloudinaryUpload } from 'src/utils/cloudinary';
import { CreateCampaignDTO, UpdateCampaignDTO } from '../dto/campaign.dto';
import { CampaignStatusEnum } from '../dto/campaign.interface';
import { CampaignGateway } from '../gateway/campaign.gateway';
import { Campaign, CampaignDocument } from '../schema/campaign.schema';
import { Endorsement } from '../schema/endorsement.schema';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(Endorsement.name)
    private readonly endorsementModel: Model<Endorsement>,
    @InjectModel(Notice.name)
    private readonly noticeModel: Model<NoticeDocument>,
    private campaignGateway: CampaignGateway,
  ) {}
  async create(data: CreateCampaignDTO, user: UserDocument): Promise<Campaign> {
    const author = user?.id;

    if (!author) throw new UnauthorizedException('No author');
    const image = await cloudinaryUpload(data.image).catch((err) => {
      throw err;
    });
    const { body } = data;
    let excerpt: string;
    if (body) {
      excerpt = body.split(' ').splice(0, 36).join(' ');
    }

    try {
      const campaign = await this.campaignModel.create({
        ...data,
        author,
        excerpt,
        image,
      });
      this.campaignGateway.createdCampaign({
        campaignTitle: campaign.title,
        user,
      });
      return campaign;
    } catch (error) {
      throw error;
    }
  }
  async findAll(limit?: number): Promise<Campaign[]> {
    try {
      const campaigns = await this.campaignModel
        .find()
        .limit(limit)
        .populate('author', 'id firstName lastName')
        .populate('endorsements', 'id');

      return campaigns as unknown as Promise<CampaignDocument[]>;
    } catch (error) {
      throw error;
    }
  }
  async findOne(slug: string): Promise<CampaignDocument> {
    try {
      const campaigns = await this.campaignModel
        .findOne({ slug })
        .populate('author', 'id firstName lastName')
        .populate('endorsements');

      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async update(data: Partial<UpdateCampaignDTO>): Promise<Campaign> {
    try {
      const campaign = await this.campaignModel.findOneAndUpdate(
        { _id: data.id },
        data,
        { new: true },
      );
      return campaign;
    } catch (error) {
      throw error;
    }
  }
  async delete(id: string): Promise<CampaignDocument> {
    try {
      const campaign = await this.campaignModel.findById(id);
      if (!campaign) throw new NotFoundException('Record not found');
      await this.endorsementModel.deleteMany({ campaign: id as any });
      campaign.remove();
      return campaign;
    } catch (error) {
      throw error;
    }
  }

  async like(
    campaign_id: string,
    user: UserDocument,
  ): Promise<CampaignDocument> {
    const campaign = await this.campaignModel.findById(campaign_id);

    if (campaign?.likes?.includes(user.id)) {
      return await this.unLike(campaign_id, user);
    } else {
      try {
        const campaign = await this.campaignModel.findOneAndUpdate(
          { _id: campaign_id },
          { $addToSet: { likes: user?.id } },
          { new: true },
        );

        return campaign;
      } catch (error) {
        throw error;
      }
    }
  }
  async unLike(
    campaign_id: string,
    user: UserDocument,
  ): Promise<CampaignDocument> {
    try {
      const campaign = await this.campaignModel.findOneAndUpdate(
        { _id: campaign_id },
        { $pull: { likes: user?.id } },
        { new: true },
      );
      return campaign;
    } catch (error) {
      throw error;
    }
  }
  async myCampaigns(user_id: string): Promise<Campaign[]> {
    try {
      const campaigns = await this.campaignModel
        .find({
          author: user_id as any,
        })
        .sort({ createdAt: -1 });

      return campaigns;
    } catch (error) {
      throw error;
    }
  }
  async approveCampaign(campaign_id: string): Promise<CampaignDocument> {
    let campaign = await this.campaignModel.findById(campaign_id);
    try {
      campaign = await this.campaignModel.findOneAndUpdate(
        { _id: campaign_id },
        {
          $set: {
            status:
              campaign.status === CampaignStatusEnum.Active
                ? CampaignStatusEnum.Pending
                : CampaignStatusEnum.Active,
          },
        },
        { new: true },
      );
      return campaign;
    } catch (error) {
      throw error;
    }
  }
  async findAllNotice(model?: string) {
    try {
      if (model) {
        const notifications = await this.noticeModel
          .find({
            db_model: model,
          })
          .populate({
            path: 'user',
            select: 'id image firstName lastName',
          })
          .sort({ createdAt: -1 });

        return notifications;
      } else {
        const notifications = await this.noticeModel
          .find({})
          .populate({
            path: 'user',
            select: 'id image firstName lastName',
          })
          .sort({ createdAt: -1 });

        return notifications;
      }
    } catch (error) {
      throw error;
    }
  }
}

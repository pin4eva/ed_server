import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/user/entity/user.schema';
import { CampaignStatusEnum, IEndorsement } from '../dto/campaign.interface';

export type CampaignDocument = Campaign &
  Document & {
    _doc: any;
  };

@ObjectType()
@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      doc.id = doc._id;
      delete ret._id;
      delete doc._id;

      return ret;
    },
  },
})
export class Campaign {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  image: string;
  @Prop({ required: true })
  aim: string;
  @Prop({ required: true })
  target: string;
  @Prop({ required: true })
  body: string;
  @Prop({ type: String, slug: 'title' })
  slug: string;
  @Prop()
  excerpt: string;
  @Prop({
    type: String,
    enum: CampaignStatusEnum,
    default: CampaignStatusEnum.Pending,
  })
  status: string;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Record<string, User>;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  addedFrom: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Endorsement' }] })
  endorsements: IEndorsement[];
  @Prop()
  endorsementCount: number;
  @Prop()
  likes: string[];
  @Prop()
  likeCount: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

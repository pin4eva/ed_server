import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/entity/user.schema';

export type TransactionDocument = Transaction &
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
export class Transaction {
  @Prop()
  message: string;
  @Prop()
  reference: string;
  @Prop()
  status: string;
  @Prop()
  transaction: string;
  @Prop()
  amount: number;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

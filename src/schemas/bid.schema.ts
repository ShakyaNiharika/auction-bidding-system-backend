import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Auction } from './auction.schema';

@Schema({ timestamps: true })
export class Bid extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Auction', required: true })
    auction: Auction;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    bidder: User;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ default: Date.now })
    bid_time: Date;
}

export const BidSchema = SchemaFactory.createForClass(Bid);

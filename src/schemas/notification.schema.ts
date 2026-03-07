import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Auction } from './auction.schema';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
    OUTBID = 'OUTBID',
    WINNER = 'WINNER',
    INFO = 'INFO',
}

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @Prop({ required: true })
    message: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Auction' })
    auction: Auction;

    @Prop({ default: false })
    read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export enum AuctionStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum WeightUnit {
    TONS = 'tons',
    KG = 'kg',
    QUINTAL = 'quintal',
}

@Schema({ timestamps: true })
export class Auction extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    seller: User;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, min: 0 })
    starting_price: number;

    @Prop({ default: function () { return this.starting_price; } })
    current_price: number;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ type: String, enum: WeightUnit, default: WeightUnit.TONS })
    unit: WeightUnit;

    @Prop({ required: true })
    harvest_date: Date;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    start_time: Date;

    @Prop({ required: true })
    end_time: Date;

    @Prop({ type: String, enum: AuctionStatus, default: AuctionStatus.ACTIVE })
    status: AuctionStatus;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    winner: User;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Bid' })
    winning_bid: any; // Using any or importing Bid to avoid circular dep if necessary
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);

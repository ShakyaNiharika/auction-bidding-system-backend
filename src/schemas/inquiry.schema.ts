import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum InquiryStatus {
    PENDING = 'pending',
    READ = 'read',
    RESOLVED = 'resolved',
}

@Schema({ timestamps: true })
export class Inquiry extends Document {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    inquiryType: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    message: string;

    @Prop({ type: String, enum: InquiryStatus, default: InquiryStatus.PENDING })
    status: InquiryStatus;
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);

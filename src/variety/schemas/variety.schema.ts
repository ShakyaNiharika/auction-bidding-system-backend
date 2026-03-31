import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Variety extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    image: string;

    @Prop()
    tag: string; // e.g. TRENDING, IN SEASON

    @Prop()
    metricValue: string; // e.g. 10.5 - 11.2%

    @Prop()
    metricLabel: string; // e.g. SUGAR RECOVERY
}

export const VarietySchema = SchemaFactory.createForClass(Variety);

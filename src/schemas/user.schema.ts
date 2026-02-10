import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
    BUYER = 'buyer',
    SELLER = 'seller',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password_hash: string;

    @Prop({ required: true })
    first_name: string;

    @Prop({ required: true })
    last_name: string;

    @Prop({ required: true })
    phone_number: string;

    @Prop()
    address: string;

    @Prop()
    date_of_birth: Date;

    @Prop({ type: String, enum: UserRole, default: UserRole.BUYER })
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

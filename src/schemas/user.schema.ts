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

    @Prop({ unique: true, sparse: true })
    username: string;

    @Prop({ required: false })
    password_hash?: string;

    @Prop({ required: true })
    first_name: string;

    @Prop({ required: true })
    last_name: string;

    @Prop({ required: false })
    phone_number?: string;

    @Prop()
    address?: string;

    @Prop()
    date_of_birth?: Date;

    @Prop({ type: String, enum: UserRole, default: UserRole.BUYER })
    role: UserRole;

    @Prop()
    profile_picture?: string;

    @Prop({ unique: true, sparse: true })
    googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

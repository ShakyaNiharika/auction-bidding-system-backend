import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async findAll() {
        return await this.userModel.find().select('-password_hash').exec();
    }

    async findOne(id: string) {
        const user = await this.userModel.findById(id).select('-password_hash').exec();
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return user;
    }
}

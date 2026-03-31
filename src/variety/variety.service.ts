import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variety } from './schemas/variety.schema';

@Injectable()
export class VarietyService {
    constructor(@InjectModel(Variety.name) private varietyModel: Model<Variety>) {}

    async findAll(): Promise<Variety[]> {
        return this.varietyModel.find().sort({ name: 1 }).exec();
    }

    async create(data: Partial<Variety>): Promise<Variety> {
        try {
            const newVariety = new this.varietyModel(data);
            return await newVariety.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Variety already exists');
            }
            throw error;
        }
    }

    async update(id: string, data: Partial<Variety>): Promise<Variety> {
        const variety = await this.varietyModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        ).exec();
        
        if (!variety) throw new NotFoundException('Variety not found');
        return variety;
    }

    async remove(id: string): Promise<void> {
        const result = await this.varietyModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Variety not found');
    }
}

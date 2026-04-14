import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inquiry, InquiryStatus } from '../schemas/inquiry.schema';

@Injectable()
export class InquiryService {
    constructor(@InjectModel(Inquiry.name) private inquiryModel: Model<Inquiry>) { }

    async create(createInquiryDto: any): Promise<Inquiry> {
        const newInquiry = new this.inquiryModel(createInquiryDto);
        return await newInquiry.save();
    }

    async findAll(): Promise<Inquiry[]> {
        return await this.inquiryModel.find().sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Inquiry> {
        const inquiry = await this.inquiryModel.findById(id).exec();
        if (!inquiry) {
            throw new NotFoundException(`Inquiry #${id} not found`);
        }
        return inquiry;
    }

    async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
        const inquiry = await this.inquiryModel.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        ).exec();

        if (!inquiry) {
            throw new NotFoundException(`Inquiry #${id} not found`);
        }
        return inquiry;
    }

    async remove(id: string): Promise<any> {
        const result = await this.inquiryModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Inquiry #${id} not found`);
        }
        return { deleted: true };
    }
}

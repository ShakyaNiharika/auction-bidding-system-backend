import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { Inquiry, InquirySchema } from '../schemas/inquiry.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }]),
    ],
    controllers: [InquiryController],
    providers: [InquiryService],
    exports: [InquiryService],
})
export class InquiryModule { }

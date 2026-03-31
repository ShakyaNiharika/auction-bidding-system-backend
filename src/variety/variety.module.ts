import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Variety, VarietySchema } from './schemas/variety.schema';
import { VarietyService } from './variety.service';
import { VarietyController } from './variety.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Variety.name, schema: VarietySchema }]),
    ],
    providers: [VarietyService],
    controllers: [VarietyController],
    exports: [VarietyService],
})
export class VarietyModule {}

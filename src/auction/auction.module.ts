import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { AuctionCronService } from './auction-cron.service';
import { Auction, AuctionSchema } from '../schemas/auction.schema';
import { Bid, BidSchema } from '../schemas/bid.schema';
import { GatewayModule } from './gateway.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Auction.name, schema: AuctionSchema },
            { name: Bid.name, schema: BidSchema },
        ]),
        GatewayModule,
    ],
    controllers: [AuctionController],
    providers: [AuctionService, AuctionCronService],
    exports: [MongooseModule, AuctionService],
})
export class AuctionModule { }

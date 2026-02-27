import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { BiddingGateway } from './bidding.gateway';
import { Auction, AuctionSchema } from '../schemas/auction.schema';
import { Bid, BidSchema } from '../schemas/bid.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Auction.name, schema: AuctionSchema },
            { name: Bid.name, schema: BidSchema },
        ]),
    ],
    controllers: [AuctionController],
    providers: [AuctionService, BiddingGateway],
    exports: [MongooseModule],
})
export class AuctionModule { }

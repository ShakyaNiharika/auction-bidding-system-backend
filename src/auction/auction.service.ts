import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auction, AuctionStatus } from '../schemas/auction.schema';
import { Bid } from '../schemas/bid.schema';
import { User, UserRole } from '../schemas/user.schema';

@Injectable()
export class AuctionService {
    constructor(
        @InjectModel(Auction.name) private auctionModel: Model<Auction>,
        @InjectModel(Bid.name) private bidModel: Model<Bid>,
    ) { }

    async create(auctionData: any, user: any) {
        // Only sellers can create auctions
        if (user.role !== UserRole.SELLER) {
            throw new BadRequestException('Only sellers can create auctions');
        }

        const newAuction = new this.auctionModel({
            ...auctionData,
            seller: user.id,
            status: AuctionStatus.ACTIVE, // Default to active for now
        });

        return await newAuction.save();
    }

    async findAll() {
        return await this.auctionModel
            .find({ status: AuctionStatus.ACTIVE })
            .populate('seller', 'username first_name last_name')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(id: string) {
        const auction = await this.auctionModel
            .findById(id)
            .populate('seller', 'username first_name last_name')
            .exec();

        if (!auction) {
            throw new NotFoundException(`Auction #${id} not found`);
        }
        return auction;
    }
}

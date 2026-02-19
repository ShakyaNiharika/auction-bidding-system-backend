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

    async findAll(query?: any) {
        const { keyword, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const filter: any = { status: AuctionStatus.ACTIVE };
        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ];
        }

        return await this.auctionModel
            .find(filter)
            .populate('seller', 'username first_name last_name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .exec();
    }

    async findMyAuctions(sellerId: string) {
        return await this.auctionModel
            .find({ seller: sellerId })
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

    async placeBid(auctionId: string, amount: number, bidderId: string) {
        const auction = await this.auctionModel.findById(auctionId);
        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        if (auction.status !== AuctionStatus.ACTIVE) {
            throw new BadRequestException('Auction is not active');
        }

        if (auction.seller.toString() === bidderId) {
            throw new BadRequestException('Sellers cannot bid on their own auctions');
        }

        if (new Date() > new Date(auction.end_time)) {
            throw new BadRequestException('Auction has ended');
        }

        const currentPrice = auction.current_price || auction.starting_price;
        if (amount <= currentPrice) {
            throw new BadRequestException(`Bid must be higher than current price: ${currentPrice}`);
        }

        const newBid = new this.bidModel({
            auction: auctionId,
            bidder: bidderId,
            amount: amount,
        });

        await newBid.save();

        // Update auction with new price
        auction.current_price = amount;
        await auction.save();

        return newBid;
    }

    async update(id: string, updateAuctionDto: any, user: any) {
        const auction = await this.findOne(id);

        if (auction.seller['_id'].toString() !== user.id) {
            throw new BadRequestException('You can only update your own auctions');
        }

        Object.assign(auction, updateAuctionDto);
        return await auction.save();
    }

    async remove(id: string, user: any) {
        const auction = await this.findOne(id);

        if (auction.seller['_id'].toString() !== user.id) {
            throw new BadRequestException('You can only delete your own auctions');
        }

        return await this.auctionModel.findByIdAndDelete(id).exec();
    }

    async getParticipants(sellerId: string) {
        // Find all auctions by this seller
        const auctions = await this.auctionModel.find({ seller: sellerId }).select('_id');
        const auctionIds = auctions.map(a => a._id);

        // Find all bids for these auctions
        const bids = await this.bidModel
            .find({ auction: { $in: auctionIds } })
            .populate('bidder', 'username email first_name last_name')
            .populate('auction', 'title')
            .exec();

        // Group by bidder to get unique participants and their activity
        const participantsMap = new Map();

        bids.forEach(bid => {
            const bidderId = (bid.bidder as any)._id.toString();
            if (!participantsMap.has(bidderId)) {
                participantsMap.set(bidderId, {
                    bidder: bid.bidder,
                    totalBids: 0,
                    lastBidTime: bid.bid_time,
                    auctionsInteracted: new Set()
                });
            }

            const participant = participantsMap.get(bidderId);
            participant.totalBids += 1;
            participant.auctionsInteracted.add((bid.auction as any).title);
            if (bid.bid_time > participant.lastBidTime) {
                participant.lastBidTime = bid.bid_time;
            }
        });

        return Array.from(participantsMap.values()).map(p => ({
            ...p,
            auctionsInteracted: Array.from(p.auctionsInteracted)
        }));
    }
}

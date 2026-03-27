import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { Auction, AuctionStatus } from '../schemas/auction.schema';
import { Bid } from '../schemas/bid.schema';
import { User, UserRole } from '../schemas/user.schema';
import { BiddingGateway } from './bidding.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../schemas/notification.schema';

@Injectable()
export class AuctionService {
    constructor(
        @InjectModel(Auction.name) private auctionModel: Model<Auction>,
        @InjectModel(Bid.name) private bidModel: Model<Bid>,
        private readonly biddingGateway: BiddingGateway,
        private readonly notificationService: NotificationService,
    ) { }

    async create(auctionData: any, user: any) {
        // Only sellers can create auctions
        if (user.role !== UserRole.SELLER) {
            throw new BadRequestException('Only sellers can create auctions');
        }

        const newAuction = new this.auctionModel({
            ...auctionData,
            seller: user.id,
            variety: auctionData.variety,
            status: AuctionStatus.ACTIVE, 
        });

        return await newAuction.save();
    }

    async findAll(query?: AuctionQueryDto) {
        const { keyword, page = 1, limit = 10, variety, status } = query || {};
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (variety) {
            filter.variety = variety;
        }
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
            .populate('winner', 'username first_name last_name email')
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

        // Get the previous highest bidder to notify them
        const previousHighestBid = await this.bidModel
            .findOne({ auction: auctionId, _id: { $ne: newBid._id } })
            .sort({ amount: -1 })
            .exec();

        if (previousHighestBid && previousHighestBid.bidder.toString() !== bidderId) {
            try {
                await this.notificationService.create(
                    previousHighestBid.bidder.toString(),
                    NotificationType.OUTBID,
                    `You have been outbid on "${auction.title}". The new price is Rs. ${amount}.`,
                    auctionId,
                );
            } catch (error) {
                console.error('Failed to send outbid notification:', error);
            }
        }

        // Atomically update auction with new price ONLY if it's still active and end_time hasn't passed
        const updatedAuction = await this.auctionModel.findOneAndUpdate(
            {
                _id: auctionId,
                status: AuctionStatus.ACTIVE,
                end_time: { $gt: new Date() }
            },
            {
                $set: { current_price: amount }
            },
            { new: true }
        );

        if (!updatedAuction) {
            // If the auction was closed by a cron job in the millisecond between our check and update
            await newBid.deleteOne(); // Roll back the bid
            throw new BadRequestException('Auction has just ended');
        }

        // Broadcast the new bid to all clients in the auction room
        this.biddingGateway.broadcastNewBid(auctionId, {
            auctionId,
            current_price: amount,
            bid: newBid,
        });

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

    async closeExpiredAuctions() {
        const now = new Date();
        const expiredAuctions = await this.auctionModel.find({
            status: AuctionStatus.ACTIVE,
            end_time: { $lte: now }
        }).exec();

        for (const auction of expiredAuctions) {
            console.log(`Closing auction: ${auction._id} - ${auction.title}`);

            // Find the highest bid for this auction
            const highestBid = await this.bidModel
                .findOne({ auction: auction._id })
                .sort({ amount: -1 })
                .populate('bidder', 'username first_name last_name email')
                .exec();

            if (highestBid) {
                // Atomically mark as completed only if it is still ACTIVE
                // This prevents multiple nodes/cron jobs from competing
                const updated = await this.auctionModel.findOneAndUpdate(
                    { _id: auction._id, status: AuctionStatus.ACTIVE },
                    {
                        $set: {
                            status: AuctionStatus.COMPLETED,
                            winner: highestBid.bidder,
                            winning_bid: highestBid._id
                        }
                    },
                    { new: true }
                ).exec();

                if (!updated) continue; // Already processed by someone else

                // Notify the winner using the accurate bid amount
                try {
                    await this.notificationService.create(
                        (highestBid.bidder as any)._id.toString(),
                        NotificationType.WINNER,
                        `Congratulations! You won the auction for "${auction.title}" with a bid of Rs. ${highestBid.amount}.`,
                        (auction._id as any).toString(),
                    );
                } catch (error) {
                    console.error('Failed to send winner notification:', error);
                }

                // Broadcast that the auction has ended
                this.biddingGateway.server.to(`auction_${auction._id}`).emit('auctionEnded', {
                    auctionId: auction._id,
                    winner: highestBid.bidder,
                    finalPrice: highestBid.amount,
                });
            } else {
                // If no bids, just mark as completed
                await this.auctionModel.findOneAndUpdate(
                    { _id: auction._id, status: AuctionStatus.ACTIVE },
                    { $set: { status: AuctionStatus.COMPLETED } }
                ).exec();

                this.biddingGateway.server.to(`auction_${auction._id}`).emit('auctionEnded', {
                    auctionId: auction._id,
                    winner: null,
                    finalPrice: auction.starting_price,
                });
            }
        }
    }
}

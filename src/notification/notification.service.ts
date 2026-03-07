import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../schemas/notification.schema';
import { BiddingGateway } from '../auction/bidding.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        private biddingGateway: BiddingGateway,
    ) { }

    async create(userId: string, type: NotificationType, message: string, auctionId: string) {
        const notification = new this.notificationModel({
            user: userId,
            type,
            message,
            auction: auctionId,
        });
        const savedNotification = await notification.save();

        // Emit real-time notification to the user
        this.biddingGateway.server.to(userId).emit('notification', savedNotification);

        return savedNotification;
    }

    async findAll(userId: string) {
        return this.notificationModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('auction', 'title')
            .exec();
    }

    async markAsRead(notificationId: string) {
        return this.notificationModel.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true },
        );
    }

    async getUnreadCount(userId: string) {
        return this.notificationModel.countDocuments({ user: userId, read: false });
    }
}

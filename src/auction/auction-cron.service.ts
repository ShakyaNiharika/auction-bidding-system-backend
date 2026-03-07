import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from './auction.service';

@Injectable()
export class AuctionCronService {
    private readonly logger = new Logger(AuctionCronService.name);

    constructor(private readonly auctionService: AuctionService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Running cron job to close expired auctions');
        await this.auctionService.closeExpiredAuctions();
    }
}

import { Module, Global } from '@nestjs/common';
import { BiddingGateway } from './bidding.gateway';

@Global()
@Module({
    providers: [BiddingGateway],
    exports: [BiddingGateway],
})
export class GatewayModule { }

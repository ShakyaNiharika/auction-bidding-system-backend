import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('initiate')
    @ApiOperation({ summary: 'Initiate Khalti payment for a won auction' })
    async initiatePayment(
        @Body('auctionId') auctionId: string,
        @Req() req: any
    ) {
        return this.paymentService.initiatePayment(auctionId, req.user);
    }

    @Post('verify')
    @ApiOperation({ summary: 'Verify Khalti payment using pidx' })
    async verifyPayment(@Body('pidx') pidx: string) {
        return this.paymentService.verifyPayment(pidx);
    }
}

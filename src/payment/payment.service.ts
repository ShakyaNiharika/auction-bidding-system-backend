import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Auction, AuctionStatus, PaymentStatus } from '../schemas/auction.schema';

@Injectable()
export class PaymentService {
    // In a real app, load this from environment variables.
    // For local testing, if KHALTI_SECRET_KEY is not set in .env, we use a placeholder.
    // We will intercept calls using this placeholder to simulate a successful payment flow.
    private readonly PLACEHOLDER_KEY = 'b8a4f91e92d743a491e5d796ecf6f059'; 
    private readonly KHALTI_SECRET_KEY: string; 
    private readonly KHALTI_API_URL = 'https://a.khalti.com/api/v2';

    constructor(
        @InjectModel(Auction.name) private auctionModel: Model<Auction>,
        private configService: ConfigService,
    ) { 
        this.KHALTI_SECRET_KEY = (this.configService.get<string>('KHALTI_SECRET_KEY') || this.PLACEHOLDER_KEY).trim();
    }

    async initiatePayment(auctionId: string, user: any) {
        const auction: any = await this.auctionModel
            .findById(auctionId)
            .populate('winner')
            .exec();

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        if (auction.status !== AuctionStatus.COMPLETED) {
            throw new BadRequestException('Auction is not completed yet');
        }

        if (auction.winner._id.toString() !== user.id) {
            throw new BadRequestException('You are not the winner of this auction');
        }

        if (auction.payment_status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment for this auction is already completed');
        }

        // Khalti expects amount in paisa (Rs. * 100)
        const amountInPaisa = Math.round(auction.current_price * 100);

        // Bypass for Sandbox Testing if Secret Key is missing
        if (this.KHALTI_SECRET_KEY === this.PLACEHOLDER_KEY) {
            console.log("Using Mock Khalti Flow since no real key was provided.");
            const mockPidx = `mock_pidx_${auction._id.toString()}_${Date.now()}`;
            return {
                pidx: mockPidx,
                payment_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/mock-checkout?pidx=${mockPidx}&transaction_id=mock_tx_${Date.now()}&purchase_order_id=${auction._id.toString()}&amount=${amountInPaisa}&title=${encodeURIComponent(auction.title)}`,
                expires_at: new Date(Date.now() + 3600000).toISOString(),
                expires_in: 3600
            };
        }

        try {
            const response = await fetch(`${this.KHALTI_API_URL}/epayment/initiate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `key ${this.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
                    website_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
                    amount: amountInPaisa,
                    // Pass the auction ID in purchase_order_id so we know what we are paying for
                    purchase_order_id: auction._id.toString(),
                    purchase_order_name: auction.title,
                    customer_info: {
                        name: user.first_name + ' ' + user.last_name,
                        email: user.email,
                        phone: '9800000000' // Khalti requires a phone number, but we can send a dummy one if user schema lacks it
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Khalti Error Payload:", data);
                throw new BadRequestException(data.detail || 'Failed to initiate Khalti payment');
            }

            return data; // Returns { pidx, payment_url, etc. }
        } catch (error: any) {
            console.error('Khalti Initiate Error:', error);
            throw new BadRequestException(error.message || 'Payment initiation failed');
        }
    }

    async verifyPayment(pidx: string) {
        if (!pidx) {
            throw new BadRequestException('pidx is required for verification');
        }

        try {
            // Mock Flow Bypass
            if (this.KHALTI_SECRET_KEY === this.PLACEHOLDER_KEY && pidx.startsWith('mock_pidx_')) {
                const parts = pidx.split('_');
                const auctionId = parts[2]; // mock_pidx_[auctionId]_[timestamp]
                
                if (auctionId) {
                    await this.auctionModel.findByIdAndUpdate(auctionId, {
                        $set: { payment_status: PaymentStatus.COMPLETED }
                    });
                    return { success: true, message: 'Mock payment verified and auction updated successfully', data: { status: 'Completed', pidx } };
                }
                return { success: false, message: 'Mock verification failed: missing auction ID in pidx' };
            }

            // Check the status of the pidx with Khalti
            const response = await fetch(`${this.KHALTI_API_URL}/epayment/lookup/`, {
                method: 'POST',
                headers: {
                    'Authorization': `key ${this.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pidx })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new BadRequestException(data.detail || 'Failed to verify payment');
            }

            // data.status will be 'Completed', 'Pending', 'Refunded', 'Expired', 'User canceled'
            if (data.status === 'Completed') {
                const auctionId = data.purchase_order_id;
                
                // Update auction status to PAID
                await this.auctionModel.findByIdAndUpdate(auctionId, {
                    $set: { payment_status: PaymentStatus.COMPLETED }
                });

                return { success: true, message: 'Payment verified and auction updated successfully', data };
            } else {
                return { success: false, message: `Payment status is ${data.status}`, data };
            }

        } catch (error: any) {
            console.error('Khalti Verify Error:', error);
            throw new BadRequestException(error.message || 'Payment verification failed');
        }
    }
}

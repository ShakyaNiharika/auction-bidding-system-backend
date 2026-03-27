import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';

@ApiTags('auctions')
@Controller('auctions')
export class AuctionController {
    constructor(private readonly auctionService: AuctionService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new auction (Seller only)' })
    @ApiResponse({ status: 201, description: 'Auction created successfully' })
    async create(@Body() createAuctionDto: CreateAuctionDto, @Request() req) {
        return this.auctionService.create(createAuctionDto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active auctions with filters' })
    async findAll(@Query() query: AuctionQueryDto) {
        return this.auctionService.findAll(query);
    }

    @Get('seller/me')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get auctions owned by the current seller' })
    async findMyAuctions(@Request() req) {
        return this.auctionService.findMyAuctions(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get auction details by ID' })
    async findOne(@Param('id') id: string) {
        return this.auctionService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an auction (Owner only)' })
    async update(@Param('id') id: string, @Body() updateAuctionDto: UpdateAuctionDto, @Request() req) {
        return this.auctionService.update(id, updateAuctionDto, req.user);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an auction (Owner only)' })
    async remove(@Param('id') id: string, @Request() req) {
        return this.auctionService.remove(id, req.user);
    }

    @Get('participants')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get participants who bid on seller auctions' })
    async getParticipants(@Request() req) {
        return this.auctionService.getParticipants(req.user.id);
    }

    @Get('stats/overview')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get overview stats for seller dashboard' })
    async getStats(@Request() req) {
        const auctions = await this.auctionService.findMyAuctions(req.user.id);
        const participants = await this.auctionService.getParticipants(req.user.id);

        return {
            activeAuctions: auctions.filter(a => a.status === 'active').length,
            totalAuctions: auctions.length,
            totalParticipants: participants.length,
            recentActivity: auctions.slice(0, 5)
        };
    }

    @Post(':id/bids')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Place a bid on an auction' })
    async placeBid(@Param('id') id: string, @Body() bidDto: CreateBidDto, @Request() req) {
        return this.auctionService.placeBid(id, bidDto.amount, req.user.id);
    }
}

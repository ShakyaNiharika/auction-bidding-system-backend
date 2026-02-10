import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuctionService } from './auction.service';

@ApiTags('auctions')
@Controller('auctions')
export class AuctionController {
    constructor(private readonly auctionService: AuctionService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new auction (Seller only)' })
    @ApiResponse({ status: 201, description: 'Auction created successfully' })
    async create(@Body() createAuctionDto: any, @Request() req) {
        return this.auctionService.create(createAuctionDto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active auctions' })
    @ApiResponse({ status: 200, description: 'Return all auctions' })
    async findAll() {
        return this.auctionService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get auction details by ID' })
    @ApiResponse({ status: 200, description: 'Return auction details' })
    @ApiResponse({ status: 404, description: 'Auction not found' })
    async findOne(@Param('id') id: string) {
        return this.auctionService.findOne(id);
    }
}

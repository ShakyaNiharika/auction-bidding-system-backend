import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryStatus } from '../schemas/inquiry.schema';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('inquiry')
@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) { }

    @Post()
    @ApiOperation({ summary: 'Submit a new inquiry' })
    @ApiResponse({ status: 201, description: 'Inquiry submitted successfully' })
    async create(@Body() createInquiryDto: any) {
        return this.inquiryService.create(createInquiryDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all inquiries (Admin only)' })
    @ApiResponse({ status: 200, description: 'Return all inquiries' })
    async findAll() {
        return this.inquiryService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get inquiry details by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'Return inquiry details' })
    async findOne(@Param('id') id: string) {
        return this.inquiryService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update inquiry status (Admin only)' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: InquiryStatus,
    ) {
        return this.inquiryService.updateStatus(id, status);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete inquiry (Admin only)' })
    @ApiResponse({ status: 200, description: 'Inquiry deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.inquiryService.remove(id);
    }
}

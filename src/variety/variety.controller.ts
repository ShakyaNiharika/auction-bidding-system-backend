import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VarietyService } from './variety.service';

@ApiTags('Variety')
@Controller('varieties')
export class VarietyController {
    constructor(private readonly varietyService: VarietyService) {}

    @Get()
    @ApiOperation({ summary: 'Get all sugarcane varieties' })
    findAll() {
        return this.varietyService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new variety (Admin/Auth)' })
    create(@Body() data: any) {
        return this.varietyService.create(data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a variety' })
    update(@Param('id') id: string, @Body() data: any) {
        return this.varietyService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a variety' })
    remove(@Param('id') id: string) {
        return this.varietyService.remove(id);
    }
}

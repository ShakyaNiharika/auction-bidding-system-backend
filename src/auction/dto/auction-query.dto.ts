import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuctionQueryDto {
    @ApiPropertyOptional({ description: 'Search keyword for title/description' })
    @IsString()
    @IsOptional()
    keyword?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page', default: 10 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: 'Filter by sugarcane variety' })
    @IsString()
    @IsOptional()
    variety?: string;

    @ApiPropertyOptional({ description: 'Filter by auction status' })
    @IsString()
    @IsOptional()
    status?: string;
}

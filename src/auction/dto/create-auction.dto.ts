import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeightUnit } from '../../schemas/auction.schema';

export class CreateAuctionDto {
    @ApiProperty({ example: 'Fresh Sugarcane Lot - Kathmandu', description: 'Auction title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'High quality raw sugarcane, freshly harvested from Terai region.', description: 'Detailed description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 5000, description: 'Starting bid price' })
    @IsNumber()
    @Min(0)
    starting_price: number;

    @ApiProperty({ example: 100, description: 'Quantity available' })
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiProperty({ enum: WeightUnit, default: WeightUnit.TONS, description: 'Unit of measurement' })
    @IsEnum(WeightUnit)
    @IsOptional()
    unit?: WeightUnit;

    @ApiProperty({ example: '2026-03-15', description: 'Harvest date of the sugarcane' })
    @IsDateString()
    harvest_date: string;

    @ApiProperty({ example: 'Bharatpur, Chitwan', description: 'Pickup location' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: '2026-02-12T10:00:00Z', description: 'When bidding starts' })
    @IsDateString()
    start_time: string;

    @ApiProperty({ example: '2026-02-15T18:00:00Z', description: 'When bidding ends' })
    @IsDateString()
    @IsNotEmpty()
    end_time: string;

    @ApiProperty({ example: 'CO 0238', description: 'Sugarcane variety', required: false })
    @IsString()
    @IsOptional()
    variety?: string;

    @ApiProperty({ example: ['/uploads/img1.jpg'], description: 'Array of image URLs', required: false })
    @IsOptional()
    images?: string[];
}

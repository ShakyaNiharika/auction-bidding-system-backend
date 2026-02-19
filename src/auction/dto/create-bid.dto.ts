import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
    @ApiProperty({ example: 1500.50, description: 'The bid amount' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;
}

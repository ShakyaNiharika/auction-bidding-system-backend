import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/schemas/user.schema';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'username123', description: 'Unique username' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'password123', description: 'Strong password', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John', description: 'First Name' })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe', description: 'Last Name' })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: '9800000000', description: 'Mobile Number' })
    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @ApiProperty({ example: 'Kathmandu, Nepal', description: 'Physical Address', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '1990-01-01', description: 'Date of Birth', required: false })
    @IsDateString()
    @IsOptional()
    date_of_birth?: string;

    @ApiProperty({ enum: UserRole, default: UserRole.BUYER, description: 'User Role' })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

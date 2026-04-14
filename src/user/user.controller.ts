import { Controller, Get, Param, UseGuards, Request, Patch, Body, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Return current user profile' })
    async getProfile(@Request() req) {
        return this.userService.findOne(req.user.id);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(@Request() req, @Body() updateData: any) {
        return this.userService.update(req.user.id, updateData);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'Return user details' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User deleted' })
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    async updateAdmin(@Param('id') id: string, @Body() updateData: any) {
        return this.userService.update(id, updateData);
    }
}

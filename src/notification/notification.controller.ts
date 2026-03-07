import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    async findAll(@Request() req) {
        return this.notificationService.findAll(req.user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notifications count' })
    async getUnreadCount(@Request() req) {
        return { count: await this.notificationService.getUnreadCount(req.user.id) };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }
}

import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { TokenPayload } from 'src/common/interface';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getNotificationByUserId(@CurrentUser() user: TokenPayload) {
    return this.notificationService.getNotificationByUserId(user.userId);
  }

  @Patch('bulk')
  @UseGuards(JwtAuthGuard)
  bulkUpdateNotificationReadStatus(@CurrentUser() user: TokenPayload) {
    return this.notificationService.bulkUpdateNotificationReadStatus(
      user.userId,
    );
  }

  @Patch(':notificationId')
  @UseGuards(JwtAuthGuard)
  updateNotificationReadStatus(
    @CurrentUser() user: TokenPayload,
    @Param('notificationId') notificationId: number,
  ) {
    return this.notificationService.updateNotificationReadStatus(
      notificationId,
      user.userId,
    );
  }
}

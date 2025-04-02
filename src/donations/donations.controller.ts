import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { TokenPayload } from 'src/common/interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('newest')
  getNewestDonations() {
    return this.donationsService.getNewestDonations();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUserDonations(@CurrentUser() user: TokenPayload) {
    return this.donationsService.getUserDonations(user.userId);
  }

  @Get(':campaignSlug')
  getCampaignDonations(@Param('campaignSlug') campaignSlug: string) {
    return this.donationsService.getCampaignDonations(campaignSlug);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { FileUploadInterceptor } from 'src/common/file-upload/file-upload.interceptor';
import { TokenPayload } from 'src/common/interface';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileUploadInterceptor)
  createCampaign(
    @Body() dto: CreateCampaignDto,
    @UploadedFile() banner: Express.Multer.File,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignService.createCampaign(dto, banner, user.userId);
  }

  @Get()
  getCampaigns(
    @Query(new ValidationPipe({ transform: true }))
    dto: PaginationDto,
  ) {
    return this.campaignService.getCampaigns(dto);
  }

  @Get('newest')
  getNewestCampaign() {
    return this.campaignService.getNewestCampaigns();
  }

  @Get('user/:username')
  getUserCampaign(
    @Param('username') username: string,
    @Query(new ValidationPipe({ transform: true }))
    dto: PaginationDto,
  ) {
    return this.campaignService.getCampaignsByUser(username, dto);
  }

  @Get('detail/:slug')
  getCampaignDetail(@Param('slug') slug: string) {
    return this.campaignService.getCampaignDetail(slug);
  }

  @Patch('update/:campaignId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileUploadInterceptor)
  updateCampaign(
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: TokenPayload,
    @Param('campaignId') campaignId: number,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    banner?: Express.Multer.File,
  ) {
    return this.campaignService.updateCampaign(
      dto,
      banner,
      user.userId,
      campaignId,
    );
  }
}

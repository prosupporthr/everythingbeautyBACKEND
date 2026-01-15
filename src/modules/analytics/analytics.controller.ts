import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { ReturnType } from '@/common/classes/ReturnType';
import { AdminAuthGuard } from '@/common/guards/admin-auth/admin-auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('Analytics')
@UseGuards(AdminAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global analytics' })
  @ApiOkResponse({ description: 'Global analytics fetched' })
  async getGlobalStats(): Promise<ReturnType> {
    return this.analyticsService.getGlobalStats();
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get analytics for a business' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business analytics fetched' })
  async getBusinessStats(
    @Param('businessId') businessId: string,
  ): Promise<ReturnType> {
    return this.analyticsService.getBusinessStats(businessId);
  }
}

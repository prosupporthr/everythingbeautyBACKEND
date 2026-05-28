import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import express from 'express';
import { ReturnType } from '@common/classes/ReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';
import { UserDocument } from '@/schemas/User.schema';
import { CreateStaffDto } from './dto/Create-staff-dto';
import { StaffService } from './staff.service';
import { UpdateStaffDto } from './dto/Update-staff-dto';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('business/:businessId')
  @ApiOperation({ summary: 'Create staff for a business' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiBody({ type: CreateStaffDto })
  @ApiCreatedResponse({ description: 'Staff created successfully' })
  async createStaff(
    @Param('businessId') businessId: string,
    @Body() dto: CreateStaffDto,
    @Req() req: express.Request,
  ): Promise<ReturnType> {
    const user = req['user'] as UserDocument;
    return this.staffService.CreateStaff(businessId, user.id, dto);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get staff for a business' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business staff fetched' })
  async getBusinessStaff(
    @Param('businessId') businessId: string,
  ): Promise<ReturnType> {
    return this.staffService.getBusinessStaff(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff by ID' })
  @ApiParam({
    name: 'id',
    description: 'Staff ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Staff fetched' })
  async getStaffById(@Param('id') id: string): Promise<ReturnType> {
    return this.staffService.getStaffById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update staff by ID' })
  @ApiParam({
    name: 'id',
    description: 'Staff ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiBody({ type: UpdateStaffDto })
  @ApiOkResponse({ description: 'Staff updated' })
  async updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<ReturnType> {
    return this.staffService.updateStaff(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff by ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Staff ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Staff deleted' })
  async deleteStaff(
    @Param('id') id: string,
    @Req() req: express.Request,
  ): Promise<ReturnType> {
    const user = req['user'] as UserDocument;
    return this.staffService.softDeleteStaff(id, user.id);
  }
}

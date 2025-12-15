import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from './dto/Create-admin-dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { VerifyAdminOtpDto } from './dto/verify-admin-otp.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SuspendAdminDto } from './dto/suspend-admin.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import {
  AuthType,
  UserType,
} from '@/common/decorators/auth-type/auth-type.decorator';

@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@AuthType(UserType.ADMIN)
@ApiTags('Admin Auth')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login admin with email via OTP' })
  @ApiBody({ type: LoginAdminDto })
  @ApiOkResponse({ description: 'OTP sent to admin email' })
  async loginAdmin(@Body() dto: LoginAdminDto): Promise<ReturnType> {
    return this.adminAuthService.loginAdmin(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for admin login' })
  @ApiBody({ type: VerifyAdminOtpDto })
  @ApiOkResponse({ description: 'OTP verified and token issued' })
  async verifyAdminOtp(@Body() dto: VerifyAdminOtpDto): Promise<ReturnType> {
    return this.adminAuthService.verifyAdminOtp(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create an admin' })
  @ApiBody({ type: CreateAdminDto })
  @ApiOkResponse({ description: 'Admin created' })
  async createAdmin(@Body() dto: CreateAdminDto): Promise<ReturnType> {
    return this.adminAuthService.createAdmin(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Admins fetched' })
  async getAllAdmins(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.adminAuthService.getAllAdmins(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by id' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiOkResponse({ description: 'Admin fetched' })
  async getAdminById(@Param('id') id: string): Promise<ReturnType> {
    return this.adminAuthService.getAdminById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiOkResponse({ description: 'Admin updated' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
  ): Promise<ReturnType> {
    return this.adminAuthService.updateAdmin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiOkResponse({ description: 'Admin deleted' })
  async softDeleteAdmin(@Param('id') id: string): Promise<ReturnType> {
    return this.adminAuthService.softDeleteAdmin(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend or unsuspend an admin account' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiBody({ type: SuspendAdminDto })
  @ApiOkResponse({ description: 'Admin suspension updated' })
  async suspendAdmin(
    @Param('id') id: string,
    @Body() dto: SuspendAdminDto,
  ): Promise<ReturnType> {
    return this.adminAuthService.suspendAdmin(id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { SignupEmailDto } from './dto/signup-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginGoogleDto } from './dto/login-google.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginationQueryDto } from '@/modules/business/dto/pagination-query.dto';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { UserAuthCheckGuard } from '@/common/guards/user-auth-check/user-auth-check.guard';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';
import express from 'express';
import { UserDocument } from '@/schemas/User.schema';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user details' })
  async getCurrentUser(@Req() req: express.Request): Promise<ReturnType> {
    const user = req['user'] as UserDocument;
    return this.userService.getUserById(user._id.toString());
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(UserAuthCheckGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers(
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
  ): Promise<PaginatedReturnType> {
    return this.userService.getAllUsers(query, search);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(UserAuthCheckGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  async getUserById(@Param('id') id: string): Promise<ReturnType> {
    return this.userService.getUserById(id);
  }

  @Post('signup/email')
  @ApiOperation({ summary: 'Sign up with email and receive OTP' })
  @ApiBody({ type: SignupEmailDto })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  async signUpWithEmail(@Body() dto: SignupEmailDto): Promise<ReturnType> {
    return this.userService.signUpWithEmail(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify signup OTP and return token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified, token returned' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<ReturnType> {
    return this.userService.verifyOtp(dto);
  }

  @Post('login/google')
  @ApiOperation({ summary: 'Sign in with Google and return token' })
  @ApiBody({ type: LoginGoogleDto })
  @ApiResponse({ status: 200, description: 'Google sign-in successful' })
  async signInWithGoogle(@Body() dto: LoginGoogleDto): Promise<ReturnType> {
    return this.userService.signInWithGoogle(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: EditUserDto })
  @ApiResponse({ status: 200, description: 'User details updated' })
  async editUser(
    @Param('id') id: string,
    @Body() dto: EditUserDto,
  ): Promise<ReturnType> {
    return this.userService.editUser(id, dto);
  }

  @Post('login/email')
  @ApiOperation({ summary: 'Login with email and receive OTP' })
  @ApiBody({ type: LoginEmailDto })
  @ApiResponse({ status: 200, description: 'OTP sent to email for login' })
  async loginWithEmail(@Body() dto: LoginEmailDto): Promise<ReturnType> {
    return this.userService.loginWithEmail(dto);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to email' })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP resent to email' })
  async resendOtp(@Body() dto: ResendOtpDto): Promise<ReturnType> {
    return this.userService.resendOtp(dto);
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { AddressService } from './address.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { User } from '@/schemas/User.schema';
import type { UserDocument } from '@/schemas/User.schema';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { CreateAddressDto } from './dto/create-address.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiOkResponse({ description: 'Address created successfully' })
  async createAddress(
    @CurrentUser() user: User,
    @Body() dto: CreateAddressDto,
  ): Promise<ReturnType> {
    return this.addressService.createAddress(
      (user as unknown as UserDocument)._id.toString(),
      dto,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all user addresses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Addresses fetched successfully' })
  async getAllUserAddresses(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.addressService.getAllUserAddresses(
      (user as unknown as UserDocument)._id.toString(),
      query,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address fetched successfully' })
  async getAddressById(@Param('id') id: string): Promise<ReturnType> {
    return this.addressService.getAddressById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({ description: 'Address updated successfully' })
  async updateAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<ReturnType> {
    return this.addressService.editAddress(
      id,
      dto,
      (user as unknown as UserDocument)._id.toString(),
    );
  }

  @Patch(':id/primary')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark address as primary' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address marked as primary successfully' })
  async markAsPrimary(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ReturnType> {
    return this.addressService.markAsPrimary(
      (user as unknown as UserDocument)._id.toString(),
      id,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({ description: 'Address deleted successfully' })
  async deleteAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ReturnType> {
    return this.addressService.softDeleteAddress(
      id,
      (user as unknown as UserDocument)._id.toString(),
    );
  }
}

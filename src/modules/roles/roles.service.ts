import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '@/schemas/Role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ReturnType } from '@/common/classes/ReturnType';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto): Promise<ReturnType> {
    try {
      const createdRole = new this.roleModel(createRoleDto);
      const role = await createdRole.save();
      return new ReturnType({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<ReturnType> {
    const roles = await this.roleModel.find().exec();
    return new ReturnType({
      success: true,
      message: 'Roles fetched successfully',
      data: roles,
    });
  }

  async findOne(id: string): Promise<ReturnType> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return new ReturnType({
      success: true,
      message: 'Role fetched successfully',
      data: role,
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<ReturnType> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return new ReturnType({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  }

  async remove(id: string): Promise<ReturnType> {
    const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();
    if (!deletedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return new ReturnType({
      success: true,
      message: 'Role deleted successfully',
      data: deletedRole,
    });
  }
}

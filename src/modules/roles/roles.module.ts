import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role, RoleSchema } from '@/schemas/Role.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService, JwtService, ConfigService],
  exports: [RolesService],
})
export class RolesModule {}

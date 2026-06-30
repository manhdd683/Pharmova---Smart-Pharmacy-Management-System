import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './roles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Roles')
@Controller('api/roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một vai trò (Role) mới' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các vai trò' })
  findAll() {
    return this.rolesService.findAll();
  }
}
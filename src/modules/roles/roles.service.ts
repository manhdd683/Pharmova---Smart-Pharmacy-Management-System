import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './roles.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // Tạo vai trò mới
  async create(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({ where: { name: dto.name } });
    if (existingRole) {
      throw new BadRequestException('Vai trò này đã tồn tại trong hệ thống');
    }

    const role = this.rolesRepository.create(dto);
    return await this.rolesRepository.save(role);
  }

  // Lấy danh sách tất cả vai trò
  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }
}
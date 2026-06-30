import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';
import { CreateAuditLogDto } from './audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo nhật ký hệ thống mới
  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const auditLog = this.auditLogsRepository.create(dto);
    return await this.auditLogsRepository.save(auditLog);
  }

  // Lấy toàn bộ danh sách nhật ký
  async findAll(): Promise<AuditLog[]> {
    return await this.auditLogsRepository.find({
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      }
    });
  }
}
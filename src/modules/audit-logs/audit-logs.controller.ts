import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './audit-logs.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AuditLogs')
@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một dòng nhật ký mới' })
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ nhật ký hệ thống' })
  findAll() {
    return this.auditLogsService.findAll();
  }
}
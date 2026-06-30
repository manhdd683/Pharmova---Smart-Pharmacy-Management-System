import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateOrUpdateSettingDto } from './settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Settings')
@Controller('api/settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới hoặc cập nhật một cấu hình' })
  createOrUpdate(@Body() dto: CreateOrUpdateSettingDto) {
    return this.settingsService.createOrUpdate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả cấu hình' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Lấy thông tin cấu hình theo Key' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';
import { CreateOrUpdateSettingDto } from './settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  // Tạo mới hoặc cập nhật cấu hình hệ thống
  async createOrUpdate(dto: CreateOrUpdateSettingDto): Promise<Setting> {
    let setting = await this.settingsRepository.findOne({ where: { settingKey: dto.settingKey } });

    if (setting) {
      setting.settingValue = dto.settingValue;
      if (dto.description) setting.description = dto.description;
    } else {
      setting = this.settingsRepository.create(dto);
    }

    return await this.settingsRepository.save(setting);
  }

  // Lấy toàn bộ danh sách cấu hình
  async findAll(): Promise<Setting[]> {
    return await this.settingsRepository.find();
  }

  // Lấy giá trị của một cấu hình theo Key
  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { settingKey: key } });
    if (!setting) {
      throw new NotFoundException(`Không tìm thấy cấu hình với mã: ${key}`);
    }
    return setting;
  }
}
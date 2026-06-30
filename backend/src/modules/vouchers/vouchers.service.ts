import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Voucher } from './voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,
  ) {}

  // 1. Tạo mã giảm giá mới
  async create(dto: any): Promise<Voucher> {
    const existing = await this.vouchersRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Mã giảm giá này đã tồn tại');
    }

    const cleanCreateData: any = {
      code: dto.code,
    };

    if (dto.discountAmount !== undefined) {
      cleanCreateData.discountAmount = dto.discountAmount;
    } else if (dto.discountValue !== undefined) {
      cleanCreateData.discountAmount = dto.discountValue;
    } else {
      cleanCreateData.discountAmount = 0; 
    }

    if (dto.usageLimit !== undefined) cleanCreateData.usageLimit = dto.usageLimit;

    const rawDate = dto.expirationDate || dto.expiryDate;
    if (rawDate) {
      cleanCreateData.expirationDate = new Date(rawDate);
    }

    const voucher = this.vouchersRepository.create(cleanCreateData as DeepPartial<Voucher>);
    return await this.vouchersRepository.save(voucher);
  }

  // 2. Lấy danh sách mã giảm giá (Tự động ẩn mã hết hạn hoặc hết lượt)
  async findAll(): Promise<Voucher[]> {
    const vouchers = await this.vouchersRepository.find();
    const currentDate = new Date();

    return vouchers.filter(v => {
      // Bỏ qua mã đã hết hạn
      if (v.expirationDate && new Date(v.expirationDate) < currentDate) {
        return false;
      }
      // Bỏ qua mã đã hết lượt sử dụng
      if (v.usageLimit > 0 && v.usedCount >= v.usageLimit) {
        return false;
      }
      return true;
    });
  }

  // 3. Cập nhật mã giảm giá
  async update(id: string, dto: any): Promise<Voucher> {
    const voucher = await this.vouchersRepository.findOne({ where: { id: id as any } });
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy mã giảm giá này để sửa');
    }

    const cleanUpdateData: any = {};
    
    if (dto.code !== undefined) cleanUpdateData.code = dto.code;
    
    if (dto.discountAmount !== undefined) {
      cleanUpdateData.discountAmount = dto.discountAmount;
    } else if (dto.discountValue !== undefined) {
      cleanUpdateData.discountAmount = dto.discountValue; 
    }

    if (dto.usageLimit !== undefined) cleanUpdateData.usageLimit = dto.usageLimit;
    if (dto.usedCount !== undefined) cleanUpdateData.usedCount = dto.usedCount;

    const rawDate = dto.expirationDate || dto.expiryDate;
    if (rawDate) {
      cleanUpdateData.expirationDate = new Date(rawDate);
    } else if (rawDate === null) {
      cleanUpdateData.expirationDate = null;
    }

    await this.vouchersRepository.update(id, cleanUpdateData);
    
    return (await this.vouchersRepository.findOne({ where: { id: id as any } })) as Voucher; 
  }

  // 4. Xóa mã giảm giá
  async remove(id: string): Promise<void> {
    const voucher = await this.vouchersRepository.findOne({ where: { id: id as any } });
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy mã giảm giá này để xóa');
    }
    await this.vouchersRepository.delete(id);
  }
}
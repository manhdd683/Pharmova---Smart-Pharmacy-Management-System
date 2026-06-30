import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { CreateVoucherDto } from './vouchers.dto';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,
  ) {}

  // Tạo mã giảm giá mới
  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const existing = await this.vouchersRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Mã giảm giá này đã tồn tại');
    }

    const voucher = this.vouchersRepository.create({
      ...dto,
      expirationDate: new Date(dto.expirationDate),
    });
    return await this.vouchersRepository.save(voucher);
  }

  // Lấy danh sách mã giảm giá
  async findAll(): Promise<Voucher[]> {
    return await this.vouchersRepository.find();
  }
}
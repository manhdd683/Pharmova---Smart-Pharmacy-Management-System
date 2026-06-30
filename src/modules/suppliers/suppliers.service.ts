import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';
import { CreateSupplierDto } from './suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  // Thêm nhà cung cấp mới
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.suppliersRepository.create(dto);
    return await this.suppliersRepository.save(supplier);
  }

  // Lấy danh sách tất cả nhà cung cấp
  async findAll(): Promise<Supplier[]> {
    return await this.suppliersRepository.find();
  }

  // Lấy thông tin 1 nhà cung cấp theo ID
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }
    return supplier;
  }
}
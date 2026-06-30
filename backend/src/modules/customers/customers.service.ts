import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  // Thêm khách hàng
  async create(dto: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.customersRepository.findOne({ where: { phone: dto.phone } });
    if (existingCustomer) {
      throw new BadRequestException('Số điện thoại khách hàng đã tồn tại');
    }

    const customer = this.customersRepository.create(dto);
    return await this.customersRepository.save(customer);
  }

  // Lấy danh sách
  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find();
  }

  // Lấy chi tiết theo ID
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
    return customer;
  }

  // Lấy chi tiết theo số điện thoại (Dùng để quét điểm thưởng)
  async findByPhone(phone: string): Promise<Customer | null> {
    if (!phone) return null;
    return await this.customersRepository.findOne({ where: { phone } });
  }

  // Cập nhật
  async update(id: string, dto: CreateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return await this.customersRepository.save(customer);
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }
}
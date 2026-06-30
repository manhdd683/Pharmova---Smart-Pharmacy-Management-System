import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../users/user.entity';
import { CreateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo hồ sơ khách hàng mới
  async create(dto: CreateCustomerDto): Promise<Customer> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const existingCustomer = await this.customersRepository.findOne({ where: { userId: dto.userId } });
    if (existingCustomer) {
      throw new BadRequestException('Khách hàng này đã có hồ sơ');
    }

    const customer = this.customersRepository.create(dto);
    return await this.customersRepository.save(customer);
  }

  // Lấy danh sách khách hàng
  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({
      relations: {
        user: true,
      },
    });
  }
}
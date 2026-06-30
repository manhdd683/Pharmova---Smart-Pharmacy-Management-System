import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { User } from '../users/user.entity';
import { CreateEmployeeDto } from './employees.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo hồ sơ nhân viên mới
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const existingEmployee = await this.employeesRepository.findOne({ where: { userId: dto.userId } });
    if (existingEmployee) {
      throw new BadRequestException('Nhân viên này đã có hồ sơ');
    }

    const employeeData = {
      ...dto,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
    };

    const employee = this.employeesRepository.create(employeeData);
    return await this.employeesRepository.save(employee);
  }

  // Lấy danh sách nhân viên
  async findAll(): Promise<Employee[]> {
    return await this.employeesRepository.find({
      relations: {
        user: true,
      },
    });
  }
}
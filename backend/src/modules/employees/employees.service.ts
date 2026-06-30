import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo nhân viên
  async create(dto: any): Promise<any> {
    const existingUser = await this.usersRepository.findOne({ where: { phoneNumber: dto.phoneNumber } } as any);
    if (existingUser) {
      throw new BadRequestException('Số điện thoại này đã được đăng ký');
    }

    const roleNumber = dto.role === 'Admin' ? 1 : (dto.role === 'Dược sĩ' ? 3 : 2);

    // TỰ ĐỘNG MÃ HÓA: Băm mật khẩu người dùng nhập thành chuỗi bảo mật trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = this.usersRepository.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      passwordHash: hashedPassword, 
      role: { id: roleNumber }, 
      isActive: true
    } as any);
    
    const savedUser: any = await this.usersRepository.save(newUser);

    const employee = this.employeesRepository.create({
      userId: savedUser.id,
      hireDate: new Date(),
      department: 'Nhân sự',
      position: dto.role || 'Nhân viên',
      baseSalary: 5000000 
    } as any);
    
    await this.employeesRepository.save(employee);

    return {
      id: savedUser.id,
      fullName: savedUser.fullName,
      phoneNumber: savedUser.phoneNumber,
      role: dto.role,
      isActive: true
    };
  }

  // Lấy danh sách nhân viên
  async findAll(): Promise<any[]> {
    const employees = await this.employeesRepository.find({
      // ĐÃ FIX: Nối thêm bảng role để Web không bị mù quyền nữa
      relations: { 
        user: {
          role: true
        } 
      },
    } as any);

    return employees.map((emp: any) => ({
      id: emp.user?.id,
      fullName: emp.user?.fullName,
      phoneNumber: emp.user?.phoneNumber,
      email: emp.user?.email,
      // ĐÃ FIX: Lấy chuẩn ID từ bảng Role
      role: emp.user?.role?.id === 1 ? 'Admin' : (emp.user?.role?.id === 3 ? 'Dược sĩ' : 'Thu ngân'),
      isActive: emp.user?.isActive
    }));
  }

  // Xóa nhân viên
  async remove(id: string): Promise<any> {
    const employee = await this.employeesRepository.findOne({ where: { userId: id } } as any);
    
    if (!employee) {
      throw new BadRequestException('Không tìm thấy nhân viên này!');
    }

    await this.employeesRepository.delete(employee.id);
    await this.usersRepository.delete(id);

    return { message: 'Đã xóa nhân viên thành công' };
  }

  // Cập nhật nhân viên
  async update(id: string, dto: any): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: id } } as any);
    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản nhân viên này!');
    }

    const roleNumber = dto.role === 'Admin' ? 1 : (dto.role === 'Dược sĩ' ? 3 : 2);

    const updateData: any = {
      fullName: dto.fullName,
      email: dto.email,
      role: { id: roleNumber }
    };
    
    // TỰ ĐỘNG MÃ HÓA: Nếu người dùng thay đổi mật khẩu mới
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    await this.usersRepository.update(id, updateData);

    const employee = await this.employeesRepository.findOne({ where: { userId: id } } as any);
    if (employee && dto.role) {
      employee.position = dto.role;
      await this.employeesRepository.save(employee);
    }

    return { message: 'Cập nhật thông tin thành công!' };
  }
}
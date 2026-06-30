import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Lấy danh sách tất cả người dùng
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isActive: true,
      },
      relations: { role: true },
    });
  }

  // Tìm user bằng email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email }, 
      relations: { role: true } 
    });
  }

  // Tìm user bằng ID
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản trong hệ thống');
    return user;
  }

  // Tạo mới user
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  // Cập nhật thông tin user
  async update(id: string, userData: Partial<User>): Promise<any> {
    return this.usersRepository.update(id, userData);
  }

  // Cập nhật profile cá nhân
  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.findByEmail(updateData.email);
      if (emailExists) {
        throw new BadRequestException('Email này đã được sử dụng bởi một tài khoản khác!');
      }
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  // Đổi mật khẩu
  async changePassword(id: string, pwData: any): Promise<void> {
    const user = await this.findOne(id);

    const isMatch = await bcrypt.compare(pwData.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác!');
    }

    user.passwordHash = await bcrypt.hash(pwData.newPassword, 10);
    await this.usersRepository.save(user);
  }

  // Tìm kiếm người dùng bằng số điện thoại (POS)
 async findByPhonePOS(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { phoneNumber },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true
      }
    });
  }
}
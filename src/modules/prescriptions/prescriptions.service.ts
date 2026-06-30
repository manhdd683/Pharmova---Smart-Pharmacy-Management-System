import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { User } from '../users/user.entity';
import { CreatePrescriptionDto } from './prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo thông tin đơn thuốc mới
  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const prescription = this.prescriptionsRepository.create(dto);
    return await this.prescriptionsRepository.save(prescription);
  }

  // Lấy danh sách tất cả đơn thuốc
  async findAll(): Promise<Prescription[]> {
    return await this.prescriptionsRepository.find({
      // Dùng chuẩn mới của TypeORM
      relations: {
        user: true, 
      },
    });
  }
}
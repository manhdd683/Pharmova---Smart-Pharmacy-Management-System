import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async findAll(): Promise<any[]> {
    return await this.prescriptionsRepository.query(`SELECT * FROM Prescriptions ORDER BY createdAt DESC`);
  }

  async create(data: any): Promise<any> {
    const id = randomUUID();
    let realUserId: string | null = null;
    try {
      const userData = await this.prescriptionsRepository.query(`SELECT TOP 1 id FROM Users`);
      if (userData && userData.length > 0) realUserId = userData[0].id;
    } catch (e) {}
    if (!realUserId) realUserId = randomUUID(); 

    await this.prescriptionsRepository.query(`
      INSERT INTO Prescriptions (id, imageUrl, patientName, doctorName, diagnosis, userId, createdAt, updatedAt)
      VALUES ('${id}', '/uploads/default.jpg', N'${data.patientName}', N'${data.doctorName}', N'${data.diagnosis || ''}', '${realUserId}', GETDATE(), GETDATE())
    `);
    return { message: 'Thành công', id };
  }

  // HÀM MỚI: Cập nhật đơn thuốc
  async update(id: string, data: any): Promise<any> {
    await this.prescriptionsRepository.query(`
      UPDATE Prescriptions 
      SET patientName = N'${data.patientName}', doctorName = N'${data.doctorName}', diagnosis = N'${data.diagnosis}', updatedAt = GETDATE()
      WHERE id = '${id}'
    `);
    return { message: 'Cập nhật thành công' };
  }

  // HÀM MỚI: Xóa đơn thuốc
  async remove(id: string): Promise<void> {
    await this.prescriptionsRepository.query(`DELETE FROM Prescriptions WHERE id = '${id}'`);
  }
}
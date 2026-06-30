import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { CreateNotificationDto } from './notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // "Độ" lại hàm tạo thông báo
  async create(dto: CreateNotificationDto): Promise<any> {
    
    // KỊCH BẢN 1: CÓ TRUYỀN ID -> GỬI CHO 1 NGƯỜI
    if (dto.userId) {
      const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng để gửi thông báo');
      }

      const notification = this.notificationsRepository.create(dto);
      await this.notificationsRepository.save(notification);
      return { 
        message: 'Đã gửi thông báo thành công cho 1 tài khoản!', 
        data: notification 
      };
    } 
    
    // KỊCH BẢN 2: BỎ TRỐNG ID -> GỬI CHO TẤT CẢ
    else {
      // ĐÃ FIX: Chuyển sang cú pháp mới của TypeORM { id: true }
      const allUsers = await this.usersRepository.find({ select: { id: true } });
      
      if (allUsers.length === 0) {
        throw new NotFoundException('Hệ thống hiện tại chưa có người dùng nào');
      }

      // Tạo một mảng chứa hàng loạt thông báo
      const notifications = allUsers.map(user => {
        return this.notificationsRepository.create({
          title: dto.title,
          message: dto.message,
          userId: user.id,
          isRead: false,
        });
      });

      // Dùng lệnh save mảng để SQL Server chèn 1 phát ăn luôn, không bị lag
      await this.notificationsRepository.save(notifications);
      return { 
        message: `Đại thành công! Đã gửi thông báo đến toàn bộ ${allUsers.length} tài khoản trong hệ thống.` 
      };
    }
  }

  // Lấy danh sách tất cả thông báo
  async findAll(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC', 
      }
    });
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    
    notification.isRead = true;
    return await this.notificationsRepository.save(notification);
  }
}
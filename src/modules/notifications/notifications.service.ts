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

  // Tạo thông báo mới
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng để gửi thông báo');
    }

    const notification = this.notificationsRepository.create(dto);
    return await this.notificationsRepository.save(notification);
  }

  // Lấy danh sách tất cả thông báo
  async findAll(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC', // Sắp xếp thông báo mới nhất lên đầu
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
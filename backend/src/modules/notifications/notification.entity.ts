import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('Notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ĐÃ FIX: Thêm type nvarchar để lưu tiếng Việt
  @Column({ type: 'nvarchar', length: 255 })
  title: string;

  // ĐÃ FIX: Đổi 'text' thành nvarchar max
  @Column({ type: 'nvarchar', length: 'max' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
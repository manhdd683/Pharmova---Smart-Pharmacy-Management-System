import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';

// Bảng lưu trữ thông tin chung của đơn hàng
@Entity('Orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'Chờ xử lý' })
  status: string;

  @Column({ default: 'Tiền mặt' })
  paymentMethod: string;

  @Column({ default: 'Chưa thanh toán' })
  paymentStatus: string;

  // Thông tin khuyến mãi và điểm thưởng
  @Column({ nullable: true })
  pointsUsed: number;

  @Column({ nullable: true })
  voucherCode: string;

  // Liên kết dữ liệu khách hàng
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  // Danh sách sản phẩm trong đơn hàng
  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
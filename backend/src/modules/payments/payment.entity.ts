import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string; // Ví dụ: Tiền mặt, VNPay, MoMo

  @Column({ default: 'Đang xử lý' })
  status: string; // Đang xử lý, Thành công, Thất bại

  @Column({ nullable: true })
  transactionId: string; // Mã giao dịch trả về từ ngân hàng (nếu thanh toán online)

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
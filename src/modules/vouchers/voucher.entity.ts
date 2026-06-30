import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // Ví dụ: GIAM50K, FREESHIP

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number; // Số tiền được giảm

  @Column('int', { default: 0 })
  usageLimit: number; // Giới hạn số lần sử dụng (0 là không giới hạn)

  @Column('int', { default: 0 })
  usedCount: number; // Số lần đã được sử dụng

  @Column({ type: 'date' })
  expirationDate: Date; // Ngày hết hạn

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
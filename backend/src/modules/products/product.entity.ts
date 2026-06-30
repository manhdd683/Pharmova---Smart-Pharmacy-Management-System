import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('Products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  // Cột mới: Ngày hết hạn của thuốc
  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date;

  // ĐÃ SỬA: Chuyển imageUrl vào BÊN TRONG class
  @Column({ type: 'nvarchar', length: 500, nullable: true })
  imageUrl: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
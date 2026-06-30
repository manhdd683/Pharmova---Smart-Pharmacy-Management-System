import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

// Bảng lưu trữ lịch sử các thao tác thay đổi dữ liệu quan trọng
@Entity('AuditLogs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; 

  @Column()
  tableName: string;

  @Column({ nullable: true })
  recordId: string;

  @Column('nvarchar', { length: 'MAX', nullable: true })
  oldValues: string; 

  @Column('nvarchar', { length: 'MAX', nullable: true })
  newValues: string; 

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
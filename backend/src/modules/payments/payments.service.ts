import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from '../orders/order.entity';
import { ProcessPaymentDto } from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  // Xử lý thanh toán đơn hàng
  async processPayment(dto: ProcessPaymentDto): Promise<Payment> {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng cần thanh toán');
    }

    if (order.paymentStatus === 'Đã thanh toán') {
      throw new BadRequestException('Đơn hàng này đã được thanh toán trước đó');
    }

    // Tạo bản ghi thanh toán mới
    const payment = new Payment();
    payment.orderId = dto.orderId;
    payment.amount = order.totalAmount;
    payment.paymentMethod = dto.paymentMethod;
    payment.status = 'Thành công';
    
    // Nếu có mã giao dịch truyền vào thì mới gán, tránh lỗi null của TypeScript
    if (dto.transactionId) {
      payment.transactionId = dto.transactionId;
    }

    const savedPayment = await this.paymentsRepository.save(payment);

    // Cập nhật lại trạng thái bên bảng Orders
    order.paymentStatus = 'Đã thanh toán';
    order.status = 'Đang chuẩn bị hàng'; // Chuyển trạng thái đơn hàng sang bước tiếp theo
    await this.ordersRepository.save(order);

    return savedPayment;
  }
}
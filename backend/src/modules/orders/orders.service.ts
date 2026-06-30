import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../carts/cart.entity';
import { CartItem } from '../carts/cart-item.entity';
import { Voucher } from '../vouchers/voucher.entity'; 

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,
  ) {}

  // Lấy danh sách toàn bộ đơn hàng
  async findAll(): Promise<Order[]> {
    try {
      return await this.ordersRepository.find({
        order: { createdAt: 'DESC' }, 
        relations: { items: { product: true }, user: true }, // Dùng Object chuẩn TypeORM 0.3
      });
    } catch (error) {
      return await this.ordersRepository.find({
        order: { createdAt: 'DESC' }, 
        relations: { items: { product: true } }, 
      });
    }
  }

  // Lấy danh sách đơn hàng cá nhân
  async findMyOrders(userId: string): Promise<Order[]> {
    try {
      return await this.ordersRepository.find({
        where: { userId: userId },
        order: { createdAt: 'DESC' },
        relations: { items: { product: true }, user: true }, // Dùng Object chuẩn TypeORM 0.3
      });
    } catch (error) {
      return await this.ordersRepository.find({
        where: { userId: userId },
        order: { createdAt: 'DESC' },
        relations: { items: { product: true } },
      });
    }
  }

  // Xử lý chốt đơn hàng
  async checkout(userId: string, dto: any): Promise<Order> {
    const paymentMethod = typeof dto === 'string' ? dto : dto.paymentMethod;
    const pointsUsed = typeof dto === 'object' ? (dto.pointsUsed || 0) : 0;
    const voucherCode = typeof dto === 'object' ? dto.voucherCode : null;
    const voucherDiscount = typeof dto === 'object' ? (dto.voucherDiscount || 0) : 0;

    const cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống');
    }

    if (voucherCode) {
      const voucher = await this.vouchersRepository.findOne({ where: { code: voucherCode } });
      
      if (!voucher) {
        throw new BadRequestException('Mã giảm giá không tồn tại!');
      }

      if (voucher.expirationDate && new Date() > new Date(voucher.expirationDate)) {
        throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng!');
      }

      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng!');
      }

      const hasUsed = await this.ordersRepository.findOne({
        where: { userId: userId, voucherCode: voucherCode }
      });
      if (hasUsed) {
        throw new BadRequestException('Mã giảm giá này chỉ được sử dụng 1 lần cho mỗi tài khoản!');
      }

      voucher.usedCount += 1;
      await this.vouchersRepository.save(voucher);
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      totalAmount += Number(item.product.price) * item.quantity;
    }

    const pointsDiscount = pointsUsed * 1000; 
    const finalTotal = Math.max(0, totalAmount - pointsDiscount - voucherDiscount);

    const newOrder = new Order();
    newOrder.userId = userId;
    newOrder.totalAmount = finalTotal; 
    newOrder.paymentMethod = paymentMethod;
    newOrder.status = 'Chờ xử lý';
    newOrder.paymentStatus = 'Chưa thanh toán';
    newOrder.pointsUsed = pointsUsed;
    newOrder.voucherCode = voucherCode;

    const savedOrder = await this.ordersRepository.save(newOrder);

    for (const item of cart.items) {
      const orderItem = new OrderItem();
      orderItem.orderId = savedOrder.id;
      orderItem.productId = item.product.id;
      orderItem.quantity = item.quantity;
      orderItem.price = item.product.price;
      await this.orderItemsRepository.save(orderItem);
    }

    await this.cartItemsRepository.remove(cart.items);

    const finalOrder = await this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: { items: { product: true }, user: true },
    });

    if (!finalOrder) {
      throw new NotFoundException('Lỗi khi tạo đơn hàng');
    }
    
    return finalOrder;
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(id: string, status: string, paymentStatus?: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    return await this.ordersRepository.save(order);
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../carts/cart.entity';
import { CartItem } from '../carts/cart-item.entity';

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
  ) {}

  // Xử lý chốt đơn hàng
  async checkout(userId: string, paymentMethod: string): Promise<Order> {
    const cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống');
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      totalAmount += Number(item.product.price) * item.quantity;
    }

    const newOrder = new Order();
    newOrder.userId = userId;
    newOrder.totalAmount = totalAmount;
    newOrder.paymentMethod = paymentMethod;
    newOrder.status = 'Chờ xử lý';
    newOrder.paymentStatus = 'Chưa thanh toán';

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
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!finalOrder) {
      throw new NotFoundException('Lỗi khi tạo đơn hàng');
    }

    return finalOrder;
  }
}
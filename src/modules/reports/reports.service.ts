import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // Tính toán số liệu thống kê tổng quan
  async getDashboardStats() {
    const totalOrders = await this.ordersRepository.count();
    
    const orders = await this.ordersRepository.find();
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    const totalProducts = await this.productsRepository.count();

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
    };
  }
}
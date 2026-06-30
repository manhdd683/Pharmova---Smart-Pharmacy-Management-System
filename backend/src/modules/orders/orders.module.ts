import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../carts/cart.entity';
import { CartItem } from '../carts/cart-item.entity';
import { Voucher } from '../vouchers/voucher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, Voucher])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
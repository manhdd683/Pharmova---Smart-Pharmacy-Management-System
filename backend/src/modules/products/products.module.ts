import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Customer } from '../customers/customer.entity';
import { Payment } from '../payments/payment.entity'; 

@Module({
  imports: [
   
    TypeOrmModule.forFeature([Product, Order, OrderItem, Customer, Payment]), 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
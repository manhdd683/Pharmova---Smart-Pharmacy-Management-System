import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Customer } from '../customers/customer.entity';
import { Payment } from '../payments/payment.entity'; // Kéo bảng Payment vào đây
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Payment) // Bơm công cụ xử lý Payment vào đây
    private paymentsRepository: Repository<Payment>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ relations: { category: true } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: { category: true } 
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepository.create(productData);
    return this.productsRepository.save(newProduct);
  }

  async update(id: string, updateData: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateData);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  // ========================================================
  // XỬ LÝ THANH TOÁN (DÙNG ENTITY PAYMENT CHUẨN TYPEORM)
  // ========================================================
  async checkout(cart: { id: string, quantity: number }[], customerId?: string, pointsToUse: number = 0): Promise<{ message: string, orderId: string }> {
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart) {
      const product = await this.findOne(item.id);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Thuốc ${product.name} chỉ còn ${product.stock} trong kho!`);
      }
      product.stock -= item.quantity;
      await this.productsRepository.save(product);
      totalAmount += (product.price * item.quantity);

      const orderItem = this.orderItemsRepository.create({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, 
      });
      orderItems.push(orderItem);
    }

    let finalAmount = totalAmount;

    if (customerId) {
      let customer = await this.customersRepository.findOne({ where: { id: customerId } });
      
      if (!customer) {
        try {
          const userData = await this.productsRepository.query(`SELECT fullName, phoneNumber FROM Users WHERE id = '${customerId}'`);
          if (userData && userData.length > 0) {
            customer = this.customersRepository.create({
              id: customerId,
              fullName: userData[0].fullName,
              phone: userData[0].phoneNumber,
              rewardPoints: 0,
              membershipTier: 'Đồng'
            });
            await this.customersRepository.save(customer);
          }
        } catch (err) {}
      }

      if (customer) {
        if (pointsToUse > 0) {
          if (customer.rewardPoints < pointsToUse) throw new BadRequestException('Khách hàng không đủ điểm!');
          const discount = pointsToUse * 1000;
          finalAmount -= discount;
          if (finalAmount < 0) finalAmount = 0;
          customer.rewardPoints -= pointsToUse;
        }

        const pointsEarned = Math.floor(finalAmount / 10000);
        customer.rewardPoints += pointsEarned;

        if (customer.rewardPoints >= 5000) customer.membershipTier = 'Vàng';
        else if (customer.rewardPoints >= 1000) customer.membershipTier = 'Bạc';
        else customer.membershipTier = 'Đồng'; 

        await this.customersRepository.save(customer);
      }
    }

    const newOrder = this.ordersRepository.create({
      totalAmount: finalAmount,
      status: 'Hoàn thành', 
      paymentMethod: 'Tiền mặt',
      paymentStatus: 'Đã thanh toán',
      items: orderItems, 
    });
    
    const savedOrder = await this.ordersRepository.save(newOrder);

    // GHI LOG VÀO BẢNG PAYMENTS BẰNG HÀM SAVE() CỦA TYPEORM
    try {
      const newPayment = this.paymentsRepository.create({
        amount: finalAmount,
        paymentMethod: 'Tiền mặt',
        status: 'Thành công',
        orderId: savedOrder.id
      });
      await this.paymentsRepository.save(newPayment);
    } catch (paymentErr) {
      throw new BadRequestException(`Lỗi chèn bảng Payments: ${paymentErr.message}`);
    }

    return { message: 'Thanh toán thành công!', orderId: savedOrder.id };
  }

  // --- HÀM NHẬP HÀNG ---
  async importProducts(payload: { supplierName: string, items: { productId: string, quantity: number, importPrice: number }[], totalAmount: number }): Promise<{ message: string }> {
    for (const item of payload.items) {
      const product = await this.findOne(item.productId);
      product.stock += item.quantity;
      await this.productsRepository.save(product);
    }

    try {
      const supplierData = await this.productsRepository.query(`
        SELECT id FROM Suppliers WHERE name = N'${payload.supplierName}'
      `);
      const realSupplierId = (supplierData && supplierData.length > 0) ? supplierData[0].id : null;

      if (realSupplierId) {
        const purchaseOrderId = randomUUID();
        let realUserId: string | null = null;
        try {
          const userData = await this.productsRepository.query(`SELECT TOP 1 id FROM Users`);
          if (userData && userData.length > 0) realUserId = userData[0].id;
        } catch (e) {}

        const userIdFields = realUserId ? `, userId` : ``;
        const userIdValues = realUserId ? `, '${realUserId}'` : ``;

        await this.productsRepository.query(`
          INSERT INTO PurchaseOrders (id, totalAmount, status, supplierId${userIdFields}, createdAt, updatedAt)
          VALUES ('${purchaseOrderId}', ${payload.totalAmount}, N'Hoàn thành', '${realSupplierId}'${userIdValues}, GETDATE(), GETDATE())
        `);

        for (const item of payload.items) {
          const orderItemId = randomUUID();
          await this.productsRepository.query(`
            INSERT INTO PurchaseOrderItems (id, quantity, unitPrice, purchaseOrderId, productId, createdAt, updatedAt)
            VALUES ('${orderItemId}', ${item.quantity}, ${item.importPrice}, '${purchaseOrderId}', '${item.productId}', GETDATE(), GETDATE())
          `);
        }
      }
    } catch (historyError) {
      console.error("Đã bỏ qua lỗi lưu lịch sử nhập hàng:", historyError.message);
    }
    return { message: 'Nhập kho thành công!' };
  }
}
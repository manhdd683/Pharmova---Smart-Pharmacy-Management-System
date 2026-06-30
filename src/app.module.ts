import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Role } from './modules/roles/role.entity';
import { User } from './modules/users/user.entity';
import { Product } from './modules/products/product.entity';
import { Category } from './modules/categories/category.entity';
import { Order } from './modules/orders/order.entity';
import { OrderItem } from './modules/orders/order-item.entity';
import { Cart } from './modules/carts/cart.entity';
import { CartItem } from './modules/carts/cart-item.entity';
import { Payment } from './modules/payments/payment.entity';
import { Supplier } from './modules/suppliers/supplier.entity';
import { Inventory } from './modules/inventory/inventory.entity';
import { PurchaseOrder } from './modules/purchase-orders/purchase-order.entity';
import { PurchaseOrderItem } from './modules/purchase-orders/purchase-order-item.entity';
import { Prescription } from './modules/prescriptions/prescription.entity';
import { Voucher } from './modules/vouchers/voucher.entity';
import { Notification } from './modules/notifications/notification.entity';
import { Customer } from './modules/customers/customer.entity';
import { Employee } from './modules/employees/employee.entity';
import { Setting } from './modules/settings/setting.entity';
import { AuditLog } from './modules/audit-logs/audit-log.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { CustomersModule } from './modules/customers/customers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Role, User, Product, Category, Order, OrderItem, Cart, CartItem, 
          Payment, Supplier, Inventory, PurchaseOrder, PurchaseOrderItem, 
          Prescription, Voucher, Notification, Customer, Employee, Setting, AuditLog
        ],
        synchronize: true,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          instanceName: 'MANHDUONG',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartsModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule,
    SuppliersModule,
    UploadsModule,
    InventoryModule,
    VouchersModule,
    PrescriptionsModule,
    CustomersModule,
    EmployeesModule,
    NotificationsModule,
    SettingsModule,
    AuditLogsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
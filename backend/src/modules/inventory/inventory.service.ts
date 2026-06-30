import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { Product } from '../products/product.entity';
import { Supplier } from '../suppliers/supplier.entity';
import { CreateInventoryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  // Nhập lô thuốc mới vào kho
  async create(dto: CreateInventoryDto): Promise<Inventory> {
    const product = await this.productsRepository.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    // Khai báo rõ kiểu dữ liệu để TypeScript không báo lỗi
    let supplier: Supplier | null = null;
    if (dto.supplierId) {
      supplier = await this.suppliersRepository.findOne({ where: { id: dto.supplierId } });
      if (!supplier) throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    const inventory = new Inventory();
    inventory.batchNumber = dto.batchNumber;
    inventory.quantity = dto.quantity;
    inventory.manufactureDate = new Date(dto.manufactureDate);
    inventory.expiryDate = new Date(dto.expiryDate);
    inventory.productId = dto.productId;
    
    // Chỉ gán nếu có truyền ID nhà cung cấp vào
    if (dto.supplierId) {
      inventory.supplierId = dto.supplierId;
    }

    return await this.inventoryRepository.save(inventory);
  }

  // Lấy toàn bộ danh sách kho hàng
  async findAll(): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      // Dùng cú pháp Object mới của TypeORM v0.3
      relations: {
        product: true,
        supplier: true,
      },
    });
  }
}
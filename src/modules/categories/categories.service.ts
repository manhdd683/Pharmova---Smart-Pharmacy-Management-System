import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // Lấy toàn bộ danh mục và sản phẩm đi kèm
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ relations: { products: true } });
  }

  // Lấy chi tiết một danh mục
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ 
      where: { id }, 
      relations: { products: true } 
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục này');
    }
    return category;
  }

  // Tạo danh mục mới
  async create(categoryData: Partial<Category>): Promise<Category> {
    const exist = await this.categoriesRepository.findOne({ where: { name: categoryData.name } });
    if (exist) {
      throw new BadRequestException('Tên danh mục này đã tồn tại');
    }
    const newCategory = this.categoriesRepository.create(categoryData);
    return this.categoriesRepository.save(newCategory);
  }

  // Cập nhật danh mục
  async update(id: string, updateData: Partial<Category>): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateData);
    return this.categoriesRepository.save(category);
  }

  // Xóa danh mục
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }
}
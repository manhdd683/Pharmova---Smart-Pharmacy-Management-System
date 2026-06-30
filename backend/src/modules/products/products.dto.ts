import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Thuốc Paracetamol 500mg', description: 'Tên sản phẩm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PARA500', description: 'Mã vạch / Mã SKU' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 50000.00, description: 'Giá bán' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 100, description: 'Số lượng tồn kho' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({ example: 'Thuốc giảm đau, hạ sốt nhanh', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-12-31', required: false, description: 'Ngày hết hạn' })
  @IsString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ example: 'b0a8d4c2-xxx...', required: false, description: 'ID danh mục' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
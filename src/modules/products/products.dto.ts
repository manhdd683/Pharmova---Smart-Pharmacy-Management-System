import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Thuốc Paracetamol 500mg', description: 'Tên sản phẩm' })
  name: string;

  @ApiProperty({ example: 'PARA500', description: 'Mã vạch / Mã SKU định danh duy nhất' })
  sku: string;

  @ApiProperty({ example: 50000.00, description: 'Giá bán' })
  price: number;

  @ApiProperty({ example: 100, description: 'Số lượng tồn kho' })
  stock: number;

  @ApiProperty({ example: 'Thuốc giảm đau, hạ sốt nhanh', required: false })
  description?: string;

  @ApiProperty({ example: 'b0a8d4c2-xxx...', required: false, description: 'ID của danh mục' })
  categoryId?: string;
}
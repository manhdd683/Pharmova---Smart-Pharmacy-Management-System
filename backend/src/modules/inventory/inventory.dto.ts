import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ example: 'BATCH-2026-06', description: 'Số lô thuốc' })
  batchNumber: string;

  @ApiProperty({ example: 100, description: 'Số lượng nhập kho' })
  quantity: number;

  @ApiProperty({ example: '2026-06-01', description: 'Ngày sản xuất (YYYY-MM-DD)' })
  manufactureDate: string;

  @ApiProperty({ example: '2028-06-01', description: 'Hạn sử dụng (YYYY-MM-DD)' })
  expiryDate: string;

  @ApiProperty({ example: 'ID_CỦA_THUỐC', description: 'ID của sản phẩm/thuốc' })
  productId: string;

  @ApiProperty({ example: 'ID_CỦA_NHÀ_CUNG_CẤP', description: 'ID của nhà cung cấp', required: false })
  supplierId?: string;
}
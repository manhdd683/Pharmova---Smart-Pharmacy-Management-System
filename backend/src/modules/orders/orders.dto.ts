import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Tiền mặt', description: 'Phương thức thanh toán' })
  paymentMethod: string;

  // --- THÊM MỚI ---
  @ApiProperty({ example: 10, required: false, description: 'Số điểm sử dụng' })
  pointsUsed?: number;

  @ApiProperty({ example: 'GIAM10K', required: false, description: 'Mã giảm giá' })
  voucherCode?: string;
  // ----------------
}
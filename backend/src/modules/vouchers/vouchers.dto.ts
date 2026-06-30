import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherDto {
  @ApiProperty({ example: 'GIAM50K', description: 'Mã giảm giá' })
  code: string;

  @ApiProperty({ example: 50000, description: 'Số tiền được giảm' })
  discountAmount: number;

  @ApiProperty({ example: 100, description: 'Giới hạn số lần sử dụng' })
  usageLimit: number;

  @ApiProperty({ example: '2026-12-31', description: 'Ngày hết hạn (YYYY-MM-DD)' })
  expirationDate: string;
}
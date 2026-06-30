import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'MÃ_ID_ĐƠN_HÀNG', description: 'ID của đơn hàng cần thanh toán' })
  orderId: string;

  @ApiProperty({ example: 'Tiền mặt', description: 'Phương thức thanh toán' })
  paymentMethod: string;

  @ApiProperty({ example: 'CHUYENKHOAN123', description: 'Mã giao dịch ngân hàng nếu có', required: false })
  transactionId?: string;
}
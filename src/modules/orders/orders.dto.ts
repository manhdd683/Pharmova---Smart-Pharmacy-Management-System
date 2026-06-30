import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Tiền mặt', description: 'Phương thức thanh toán' })
  paymentMethod: string;
}
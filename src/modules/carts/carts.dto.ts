import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'ID_CỦA_SẢN_PHẨM', description: 'ID của sản phẩm muốn thêm' })
  productId: string;

  @ApiProperty({ example: 1, description: 'Số lượng sản phẩm' })
  quantity: number;
}
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Đơn hàng thành công', description: 'Tiêu đề thông báo' })
  title: string;

  @ApiProperty({ example: 'Cảm ơn bạn đã mua hàng tại Pharmova. Đơn hàng #123 đang được chuẩn bị.', description: 'Nội dung chi tiết' })
  message: string;

  @ApiProperty({ example: 'ID_CỦA_TÀI_KHOẢN_USER', description: 'ID của người nhận thông báo' })
  userId: string;
}
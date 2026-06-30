import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Đơn hàng thành công', description: 'Tiêu đề thông báo' })
  title: string;

  @ApiProperty({ example: 'Cảm ơn bạn đã mua hàng tại Pharmova. Đơn hàng #123 đang được chuẩn bị.', description: 'Nội dung chi tiết' })
  message: string;

  // Đổi thành ApiPropertyOptional và thêm dấu ? ở userId
  @ApiPropertyOptional({ example: 'ID_CỦA_TÀI_KHOẢN_USER', description: 'ID người nhận. Bỏ trống để gửi cho TẤT CẢ' })
  userId?: string; 
}
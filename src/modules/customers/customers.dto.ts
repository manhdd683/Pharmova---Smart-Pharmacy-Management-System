import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'ID_CỦA_TÀI_KHOẢN_USER', description: 'ID của tài khoản người dùng' })
  userId: string;

  @ApiProperty({ example: 100, description: 'Điểm tích lũy ban đầu', required: false })
  rewardPoints?: number;

  @ApiProperty({ example: 'Đồng', description: 'Hạng thành viên', required: false })
  membershipTier?: string;
}
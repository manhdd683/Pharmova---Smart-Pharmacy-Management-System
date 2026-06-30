import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'ID_CỦA_TÀI_KHOẢN_USER', description: 'ID của tài khoản người dùng' })
  userId: string;

  @ApiProperty({ example: 'Bán hàng', description: 'Phòng ban làm việc' })
  department: string;

  @ApiProperty({ example: 'Dược sĩ', description: 'Chức vụ' })
  position: string;

  @ApiProperty({ example: 8000000, description: 'Lương cơ bản' })
  baseSalary: number;

  @ApiProperty({ example: '2026-06-23', description: 'Ngày bắt đầu làm việc (YYYY-MM-DD)', required: false })
  hireDate?: string;
}
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Tên vai trò' })
  name: string;

  @ApiProperty({ example: 'Quản trị viên hệ thống', description: 'Mô tả chi tiết quyền hạn', required: false })
  description?: string;
}
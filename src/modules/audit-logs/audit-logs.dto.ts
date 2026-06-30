import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'ID_CỦA_TÀI_KHOẢN', description: 'ID người thực hiện thao tác' })
  userId: string;

  @ApiProperty({ example: 'UPDATE', description: 'Hành động (CREATE, UPDATE, DELETE)' })
  action: string;

  @ApiProperty({ example: 'Products', description: 'Tên bảng bị tác động' })
  tableName: string;

  @ApiProperty({ example: 'Cập nhật giá thuốc', description: 'Chi tiết thay đổi', required: false })
  newValues?: string;
}
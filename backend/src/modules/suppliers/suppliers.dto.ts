import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Công ty Dược phẩm TW1', description: 'Tên nhà cung cấp' })
  name: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại', required: false })
  phone?: string;

  @ApiProperty({ example: 'contact@duoctw1.com', description: 'Email liên hệ', required: false })
  email?: string;

  @ApiProperty({ example: 'Hà Nội, Việt Nam', description: 'Địa chỉ', required: false })
  address?: string;
}
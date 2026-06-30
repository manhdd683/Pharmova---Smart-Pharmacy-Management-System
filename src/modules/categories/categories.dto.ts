import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Thuốc kháng sinh', description: 'Tên danh mục thuốc' })
  name: string;

  @ApiProperty({ example: 'Các loại thuốc kháng sinh đặc trị nhiễm khuẩn', required: false })
  description?: string;
}
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrUpdateSettingDto {
  @ApiProperty({ example: 'TAX_RATE', description: 'Mã cấu hình (viết hoa, không dấu)' })
  settingKey: string;

  @ApiProperty({ example: '10', description: 'Giá trị cấu hình' })
  settingValue: string;

  @ApiProperty({ example: 'Thuế VAT mặc định (%)', description: 'Mô tả ý nghĩa cấu hình', required: false })
  description?: string;
}
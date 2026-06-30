import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên người dùng' })
  fullName: string;

  @ApiProperty({ example: 'admin@pharmova.com', description: 'Địa chỉ email' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  password: string;

  @ApiProperty({ example: '0987654321', required: false, description: 'Số điện thoại' })
  phoneNumber?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@pharmova.com', description: 'Địa chỉ email' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  password: string;
}
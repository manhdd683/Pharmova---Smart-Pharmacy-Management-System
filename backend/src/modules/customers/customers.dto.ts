import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  rewardPoints?: number;

  @ApiProperty({ example: 'Đồng', required: false })
  @IsString()
  @IsOptional()
  membershipTier?: string;
}
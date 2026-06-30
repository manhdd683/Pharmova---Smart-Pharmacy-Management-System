import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: '/uploads/don-thuoc-123.jpg', description: 'Đường dẫn ảnh đơn thuốc (lấy từ API Uploads)' })
  imageUrl: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên bệnh nhân', required: false })
  patientName?: string;

  @ApiProperty({ example: 'BS. Lê B', description: 'Tên bác sĩ kê đơn', required: false })
  doctorName?: string;

  @ApiProperty({ example: 'Viêm họng cấp', description: 'Chẩn đoán', required: false })
  diagnosis?: string;

  @ApiProperty({ example: 'ID_CỦA_KHACH_HANG', description: 'ID của tài khoản người dùng tải lên đơn thuốc' })
  userId: string;
}
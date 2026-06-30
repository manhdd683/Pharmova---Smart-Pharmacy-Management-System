import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './prescriptions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Prescriptions')
@Controller('api/prescriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Lưu thông tin một đơn thuốc mới' })
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các đơn thuốc' })
  findAll() {
    return this.prescriptionsService.findAll();
  }
}
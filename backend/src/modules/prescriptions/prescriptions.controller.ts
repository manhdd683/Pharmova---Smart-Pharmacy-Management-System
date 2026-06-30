import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Prescriptions')
@Controller('api/prescriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Lưu thông tin một đơn thuốc mới' })
  create(@Body() dto: any) {
    return this.prescriptionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các đơn thuốc' })
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn thuốc' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.prescriptionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn thuốc' })
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './vouchers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Vouchers')
@Controller('api/vouchers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã giảm giá mới' })
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mã giảm giá' })
  findAll() {
    return this.vouchersService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật mã giảm giá' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.vouchersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mã giảm giá' })
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
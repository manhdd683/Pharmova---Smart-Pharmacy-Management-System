import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
}
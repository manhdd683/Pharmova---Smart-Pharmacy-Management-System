import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './customers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Customers')
@Controller('api/customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Quản lý khách hàng (Admin)
  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ khách hàng để tích điểm' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả khách hàng' })
  findAll() {
    return this.customersService.findAll();
  }

  // Tra cứu theo số điện thoại (Dùng để gộp điểm thưởng ở Frontend)
  @Get('phone/:phone')
  @ApiOperation({ summary: 'Lấy chi tiết khách hàng bằng số điện thoại' })
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  // Lấy chi tiết, cập nhật, xóa theo ID (Admin)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một khách hàng' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hồ sơ khách hàng' })
  @ApiBody({ type: CreateCustomerDto })
  update(@Param('id') id: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hồ sơ khách hàng' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
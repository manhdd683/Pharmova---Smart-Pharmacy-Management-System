import { Controller, Get, Post, Body, Delete, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './employees.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Employees')
@Controller('api/employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ nhân viên' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhân viên' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhân viên' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhân viên' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.employeesService.update(id, dto);
  }
}
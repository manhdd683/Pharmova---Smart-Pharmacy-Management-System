import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // BẮT BUỘC IMPORT CÁI NÀY ĐỂ MỞ KHÓA TOKEN

@ApiTags('Orders')
@Controller('api/orders') 
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ đơn hàng (Cho Bảng Điều Khiển)' })
  async getAllOrders() {
    return await this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard) // <--- ĐÃ BỎ DẤU // ĐỂ HỆ THỐNG NHẬN DIỆN USER
  @Get('my-orders')
  @ApiOperation({ summary: 'Lấy lịch sử mua hàng cá nhân' })
  async getMyOrders(@Request() req) {
    return await this.ordersService.findMyOrders(req.user?.userId || req.user?.id);
  }

  @UseGuards(JwtAuthGuard) // <--- ĐÃ BỎ DẤU // Ở ĐÂY LUÔN
  @Post('checkout')
  @ApiOperation({ summary: 'Chốt đơn hàng từ giỏ hàng' })
  checkout(@Request() req, @Body() dto: any) {
    return this.ordersService.checkout(req.user?.userId || req.user?.id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (Dành cho Admin/Staff)' })
  async updateOrderStatus(
    @Param('id') id: string, 
    @Body() body: { status: string; paymentStatus?: string }
  ) {
    return await this.ordersService.updateStatus(id, body.status, body.paymentStatus);
  }
}
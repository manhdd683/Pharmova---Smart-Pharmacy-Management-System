import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto } from './carts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Carts')
@Controller('api/carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin giỏ hàng của tôi' })
  getCart(@Request() req) {
    return this.cartsService.getCart(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartsService.addToCart(req.user.userId, dto.productId, dto.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  removeFromCart(@Request() req, @Param('id') id: string) {
    return this.cartsService.removeFromCart(req.user.userId, id);
  }
}
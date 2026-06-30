import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một sản phẩm theo ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Thêm sản phẩm mới hỗ trợ tải ảnh
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm mới (Hỗ trợ upload ảnh)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@Body() createProductDto: any, @UploadedFile() file: any) {
    if (file) {
      createProductDto.imageUrl = `/uploads/${file.filename}`;
    }
    return this.productsService.create(createProductDto);
  }

  // Cập nhật thông tin sản phẩm hỗ trợ tải ảnh
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm (Hỗ trợ upload ảnh)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  update(@Param('id') id: string, @Body() updateData: any, @UploadedFile() file: any) {
    if (file) {
      updateData.imageUrl = `/uploads/${file.filename}`;
    }
    return this.productsService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('checkout')
  @ApiOperation({ summary: 'Thanh toán hóa đơn, trừ tồn kho và tích/trừ điểm' })
  checkout(@Body() payload: { cart: { id: string, quantity: number }[], customerId?: string, pointsToUse?: number }) {
    return this.productsService.checkout(payload.cart, payload.customerId, payload.pointsToUse);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('import')
  @ApiOperation({ summary: 'Nhập hàng, cộng dồn tồn kho' })
  importProducts(@Body() payload: { supplierName: string, items: { productId: string, quantity: number, importPrice: number }[], totalAmount: number }) {
    return this.productsService.importProducts(payload);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
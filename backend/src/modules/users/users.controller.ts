import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  // Lấy thông tin cá nhân
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân (Yêu cầu đăng nhập)' })
  async getProfile(@Request() req: any) {
    return await this.usersService.findByEmail(req.user.email);
  }

  // Cập nhật hồ sơ cá nhân
  @ApiBearerAuth()
  @Put('profile')
  @ApiOperation({ summary: 'Khách hàng tự cập nhật thông tin cá nhân' })
  async updateProfile(@Request() req: any, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.usersService.updateProfile(userId, body);
  }

  // Đổi mật khẩu
  @ApiBearerAuth()
  @Put('change-password')
  @ApiOperation({ summary: 'Khách hàng tự đổi mật khẩu' })
  async changePassword(@Request() req: any, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.usersService.changePassword(userId, body);
  }

  // Lấy danh sách nhân viên
  @ApiBearerAuth()
  @Roles('Admin')
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhân viên' })
  findAll() {
    return this.usersService.findAll();
  }

  // Tìm kiếm khách hàng tại quầy POS
  @Get('search-phone/:phone')
  @ApiOperation({ summary: 'Tìm khách hàng theo SĐT tại quầy POS' })
  async searchByPhone(@Param('phone') phone: string) {
    return await this.usersService.findByPhonePOS(phone);
  }
}
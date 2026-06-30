import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  
  // Áp dụng Guard để bảo vệ API này
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân (Yêu cầu đăng nhập)' })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
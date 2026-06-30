import { Controller, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 

@ApiTags('Authentication') 
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu gửi mã OTP quên mật khẩu' })
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Khôi phục mật khẩu bằng mã OTP' })
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  // Các API yêu cầu xác thực Token
  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth()
  updateProfile(@Request() req: any, @Body() body: any) {
    const currentUserId = req.user?.id || req.user?.sub || req.user?.userId; 
    return this.authService.updateProfile(currentUserId, body);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth()
  changePassword(@Request() req: any, @Body() body: any) {
    const currentUserId = req.user?.id || req.user?.sub || req.user?.userId; 
    return this.authService.changePassword(currentUserId, body);
  }
}
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Xử lý đăng ký tài khoản
  async register(userData: any) {
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = await this.usersService.create({
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      passwordHash: hashedPassword,
    });

    return {
      message: 'Đăng ký thành công',
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
    };
  }

  // Xử lý đăng nhập
  async login(loginData: any) {
    const user = await this.usersService.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    let isPasswordMatching = false;

    if (user.passwordHash && user.passwordHash.startsWith('$2b$')) {
      isPasswordMatching = await bcrypt.compare(loginData.password, user.passwordHash);
    } else {
      isPasswordMatching = (user.passwordHash === loginData.password);
      
      if (isPasswordMatching) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(loginData.password, salt);
        await this.usersService.update(user.id, { passwordHash: hashedPassword });
      }
    }

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        roleId: user.role?.id,
        role: user.role
      },
    };
  }

  // Cập nhật thông tin cá nhân
  async updateProfile(userId: string, data: any) {
    await this.usersService.update(userId, {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phone, 
    });

    return { message: 'Đã cập nhật thông tin cá nhân thành công' };
  }

  // Đổi mật khẩu
  async changePassword(userId: string, data: any) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await this.usersService.update(userId, { 
      passwordHash: hashedPassword 
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Tính năng quên mật khẩu: Cấp mã OTP
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.update(user.id, { resetOtp: otp });

    console.log(`[QUAN TRỌNG] Mã OTP Khôi phục mật khẩu của ${email} là: ${otp}`);

    return { message: 'Mã OTP đã được gửi! Vui lòng kiểm tra email (hoặc Terminal).' };
  }

  // Tính năng quên mật khẩu: Xác nhận OTP và đặt lại mật khẩu
  async resetPassword(data: any) {
    const { email, otp, newPassword } = data;
    const user = await this.usersService.findByEmail(email);

    if (!user || user.resetOtp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(user.id, {
      passwordHash: hashedPassword,
      resetOtp: undefined
    });

    return { message: 'Khôi phục mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' };
  }
}
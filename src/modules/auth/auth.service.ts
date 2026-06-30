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

    const isPasswordMatching = await bcrypt.compare(loginData.password, user.passwordHash);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }
}
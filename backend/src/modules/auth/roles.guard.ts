import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Nếu API không dán nhãn @Roles thì bỏ qua kiểm tra
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // Nếu không có user, hoặc chức vụ không nằm trong danh sách cho phép -> Đá văng!
    if (!user || !user.role || !requiredRoles.includes(user.role.name)) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này!');
    }

    return true;
  }
}
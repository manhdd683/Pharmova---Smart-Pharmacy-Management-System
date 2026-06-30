import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Lấy thẻ và chức vụ từ bộ nhớ trình duyệt
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); 

  // Nếu chưa đăng nhập -> Đá về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng KHÔNG ĐÚNG QUYỀN -> Đá về trang phù hợp
  if (!allowedRoles.includes(userRole || '')) {
    if (userRole === 'Admin') return <Navigate to="/admin" replace />;
    if (userRole === 'Staff') return <Navigate to="/admin/pos" replace />;
    return <Navigate to="/" replace />; // Khách hàng thì về trang chủ
  }

  // Nếu đúng quyền -> Cho phép đi tiếp vào trong (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
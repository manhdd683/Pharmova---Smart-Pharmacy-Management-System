import axiosClient from './axiosClient';

export const authService = {
  // Đã sửa passwordHash thành password
  login: async (email: string, password: string) => { 
    const response = await axiosClient.post('/api/auth/login', {
      email,
      password, // Gửi đúng key 'password' mà Backend đang chờ
    });
    return response;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};
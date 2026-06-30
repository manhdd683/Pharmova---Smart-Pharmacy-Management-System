import axiosClient from './axiosClient';

export const notificationService = {
  // 1. Lấy danh sách thông báo để hiển thị ra cái Chuông
  getAll: async () => {
    const response = await axiosClient.get('/api/notifications');
    return response.data;
  },

  // 2. Admin gửi thông báo mới (Gửi 1 người hoặc Tất cả)
  send: async (data: { title: string; message: string; userId?: string }) => {
    const response = await axiosClient.post('/api/notifications', data);
    return response.data;
  },

  // 3. Click vào thông báo nào thì đánh dấu đã đọc thông báo đó
  markAsRead: async (id: string) => {
    const response = await axiosClient.patch(`/api/notifications/${id}/read`);
    return response.data;
  }
};
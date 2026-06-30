import axiosClient from './axiosClient';

export const prescriptionService = {
  // Lấy danh sách đơn thuốc
  getAll: async () => {
    return await axiosClient.get('/api/prescriptions');
  },
  
  // Tạo đơn thuốc mới
  create: async (data: any) => {
    return await axiosClient.post('/api/prescriptions', data);
  },

  // Cập nhật đơn thuốc mới thêm
  update: async (id: string, data: any) => {
    return await axiosClient.put(`/api/prescriptions/${id}`, data);
  },

  // Xóa đơn thuốc
  delete: async (id: string) => {
    return await axiosClient.delete(`/api/prescriptions/${id}`);
  }
};
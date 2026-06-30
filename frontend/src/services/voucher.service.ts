import axiosClient from './axiosClient';

export const voucherService = {
  // Lấy danh sách
  getAll: () => {
    return axiosClient.get('/api/vouchers'); 
  },
  
  // Thêm mới
  create: (data: any) => {
    return axiosClient.post('/api/vouchers', data); 
  },
  
  // Cập nhật
  update: (id: string, data: any) => {
    return axiosClient.put(`/api/vouchers/${id}`, data); 
  },
  
  // Xóa
  delete: (id: string) => {
    return axiosClient.delete(`/api/vouchers/${id}`); 
  }
};
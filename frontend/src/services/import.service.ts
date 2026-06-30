import axiosClient from './axiosClient';

export const importService = {
  // ĐÃ SỬA: Đổi sang gọi API của bảng Products để mượn đường cộng tồn kho
  createImport: async (data: any) => {
    return await axiosClient.post('/api/products/import', data);
  },
  
  getImports: async () => {
    // Tạm thời ẩn API lấy lịch sử nếu chưa code Backend cho phần này
    // return await axiosClient.get('/api/products/import-history');
    return [];
  }
};
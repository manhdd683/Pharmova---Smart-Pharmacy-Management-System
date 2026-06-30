import axiosClient from './axiosClient';

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: async () => {
    return await axiosClient.get('/api/products');
  }, 

  // Thêm mới sản phẩm
  createProduct: async (data: any) => {
    return await axiosClient.post('/api/products', data);
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: string, data: any) => {
    return await axiosClient.put(`/api/products/${id}`, data);
  },

  // Xóa sản phẩm
  deleteProduct: async (id: string) => {
    return await axiosClient.delete(`/api/products/${id}`);
  },

  // Thanh toán hóa đơn và trừ tồn kho
  checkout: async (cartPayload: any[]) => {
    return await axiosClient.post('/api/products/checkout', cartPayload);
  }
};
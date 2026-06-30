import axiosClient from './axiosClient';

export const categoryService = {
  // Lấy danh sách danh mục
  getCategories: async () => {
    return await axiosClient.get('/api/categories');
  },

  // Thêm mới danh mục
  createCategory: async (data: any) => {
    return await axiosClient.post('/api/categories', data);
  },

  // Cập nhật danh mục (Sửa)
  updateCategory: async (id: string, data: any) => {
    return await axiosClient.put(`/api/categories/${id}`, data);
  },

  // Xóa danh mục
  deleteCategory: async (id: string) => {
    return await axiosClient.delete(`/api/categories/${id}`);
  }
};
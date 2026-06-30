import axiosClient from './axiosClient';

export const customerService = {
  // ==========================================
  // 1. LUỒNG QUẢN TRỊ (ADMIN)
  // ==========================================
  getCustomers: async () => { 
    return await axiosClient.get('/api/customers'); 
  },
  
  createCustomer: async (data: any) => { 
    return await axiosClient.post('/api/customers', data); 
  },
  
  updateCustomer: async (id: string, data: any) => { 
    return await axiosClient.put(`/api/customers/${id}`, data); 
  },
  
  deleteCustomer: async (id: string) => { 
    return await axiosClient.delete(`/api/customers/${id}`); 
  },

  // ==========================================
  // 2. LUỒNG KHÁCH HÀNG CÁ NHÂN
  // ==========================================
  getProfile: async () => { 
    return await axiosClient.get('/api/users/profile'); 
  },
  
  getCustomerByPhone: async (phone: string) => { 
    return await axiosClient.get(`/api/customers/phone/${phone}`); 
  },
  
  getMyOrders: async () => { 
    return await axiosClient.get('/api/orders/my-orders'); 
  },
  
  // ==========================================
  // 3. CẬP NHẬT HỒ SƠ & MẬT KHẨU
  // ==========================================
  updateMyProfile: async (data: any) => {
    return await axiosClient.put('/api/users/profile', data);
  },
  
  changeMyPassword: async (data: any) => {
    return await axiosClient.put('/api/users/change-password', data);
  },

  // ==========================================
  // 4. LUỒNG QUẦY POS (BÁN HÀNG)
  // ==========================================
  searchUserByPhone: async (phone: string) => {
    return await axiosClient.get(`/api/users/search-phone/${phone}`);
  }
};
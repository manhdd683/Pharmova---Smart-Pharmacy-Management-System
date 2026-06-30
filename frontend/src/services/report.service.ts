import axiosClient from './axiosClient';

export const reportService = {
  // Nhận parameters để lọc ngày
  getDashboardData: (params?: { startDate?: string, endDate?: string }) => {
    return axiosClient.get('/api/reports/dashboard', { params });
  }
};
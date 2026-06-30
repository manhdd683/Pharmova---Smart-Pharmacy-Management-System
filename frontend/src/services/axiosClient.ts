import axios from 'axios';

// Khởi tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Trước khi gửi request đi, tự động đính kèm Token (nếu có)
axiosClient.interceptors.request.use(
  (config) => {
    // Giả sử sau này chúng ta lưu token vào localStorage khi đăng nhập thành công
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý dữ liệu trả về hoặc bắt lỗi toàn cục (như lỗi 401, 500)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Thường chỉ lấy phần data của response
  },
  (error) => {
    // Nếu lỗi 401 (Hết hạn token hoặc chưa đăng nhập)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Có thể cần chuyển hướng về trang Đăng nhập.');
      // window.location.href = '/login'; (Mở dòng này sau khi có trang login)
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
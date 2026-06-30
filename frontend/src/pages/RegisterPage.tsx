import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Mail, Lock, User, Phone, Calendar } from 'lucide-react';
import axiosClient from '../services/axiosClient';
import './LoginPage.css'; // Dùng chung CSS với trang Login cho đồng bộ

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bộ Validate (Kiểm tra dữ liệu)
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    
    if (!formData.fullName.trim()) return "Vui lòng nhập Họ và tên!";
    if (!emailRegex.test(formData.email)) return "Định dạng Email không hợp lệ!";
    if (!phoneRegex.test(formData.phone)) return "Số điện thoại không hợp lệ (Phải là SĐT Việt Nam)!";
    
    if (!formData.dateOfBirth) return "Vui lòng chọn ngày tháng năm sinh!";
    if (new Date(formData.dateOfBirth) >= new Date()) return "Ngày sinh không được ở tương lai!";
    
    if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự!";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu xác nhận không khớp!";
    
    return null; // Không có lỗi
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API đăng ký
      await axiosClient.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password
      });

      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, email có thể đã tồn tại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px', marginTop: '20px', marginBottom: '20px' }}>
        <div className="login-logo">
          <LayoutDashboard size={32} color="#10b981" />
          <span>Đăng Ký Pharmova</span>
        </div>
        
        <form onSubmit={handleRegister}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input 
                  type="text" className="input-field" placeholder="Nhập họ tên..."
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required 
                />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <Phone size={20} className="input-icon" />
                <input 
                  type="text" className="input-field" placeholder="09xx..."
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" className="input-field" placeholder="email@example.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
                />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Ngày sinh</label>
              <div className="input-wrapper">
                <Calendar size={20} className="input-icon" />
                <input 
                  type="date" className="input-field"
                  value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} required 
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Mật khẩu</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type="password" className="input-field" placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
                />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Xác nhận mật khẩu</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type="password" className="input-field" placeholder="••••••••"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required 
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fecaca' }}>{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
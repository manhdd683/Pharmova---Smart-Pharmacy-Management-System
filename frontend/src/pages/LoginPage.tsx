import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import axiosClient from '../services/axiosClient';
import { LayoutDashboard, Mail, Lock, KeyRound } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE CHO TÍNH NĂNG QUÊN MẬT KHẨU ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & MK mới
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });

  // ================= XỬ LÝ ĐĂNG NHẬP =================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: any = await authService.login(email, password);
      
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        
        // SỬA LỖI Ở ĐÂY: Mặc định là Khách Hàng (Customer)
        let userRole = 'Customer';
        const roleId = data.user?.roleId;

        if (roleId === 1) userRole = 'Admin';
        else if (roleId === 2) userRole = 'Staff';
        
        localStorage.setItem('user_role', userRole);

        // PHÂN LUỒNG CHUẨN XÁC
        if (userRole === 'Admin') {
          navigate('/admin');
        } else if (userRole === 'Staff') {
          navigate('/admin/pos');
        } else {
          // Khách hàng thì bay ra Trang chủ mua sắm
          navigate('/');
        }
      }
    } catch (err: any) {
      setError('Sai Email hoặc Mật khẩu. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= XỬ LÝ QUÊN MẬT KHẨU =================
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage({ type: '', text: '' });
    try {
      const res: any = await axiosClient.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotMessage({ type: 'success', text: res.message || 'Mã OTP đã được gửi!' });
      setForgotStep(2); // Chuyển sang bước nhập OTP
    } catch (err: any) {
      setForgotMessage({ type: 'error', text: err.response?.data?.message || 'Email không tồn tại!' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage({ type: '', text: '' });
    
    if (newPassword.length < 6) {
      setForgotMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    try {
      const res: any = await axiosClient.post('/api/auth/reset-password', { 
        email: forgotEmail, 
        otp, 
        newPassword 
      });
      alert('Khôi phục mật khẩu thành công! Hãy đăng nhập lại.');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
    } catch (err: any) {
      setForgotMessage({ type: 'error', text: err.response?.data?.message || 'Mã OTP không đúng!' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <LayoutDashboard size={32} color="#10b981" />
          <span>Pharmova</span>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email đăng nhập</label>
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input 
                type="email" className="input-field" placeholder="admin@pharmova.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input 
                type="password" className="input-field" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
          </div>

          {/* Nút Quên mật khẩu */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <span 
              onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotMessage({type: '', text: ''}); }}
              style={{ fontSize: '13px', color: '#0ea5e9', cursor: 'pointer', fontWeight: '500' }}
            >
              Quên mật khẩu?
            </span>
          </div>

          {error && <div className="error-message" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fecaca' }}>{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập hệ thống'}
          </button>

          {/* Link sang trang Đăng Ký */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </div>
        </form>
      </div>

      {/* MODAL QUÊN MẬT KHẨU */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={20} color="#0ea5e9" /> Khôi Phục Mật Khẩu
            </h3>

            {forgotMessage.text && (
              <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', backgroundColor: forgotMessage.type === 'error' ? '#fef2f2' : '#f0fdf4', color: forgotMessage.type === 'error' ? '#ef4444' : '#15803d', border: `1px solid ${forgotMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
                {forgotMessage.text}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOTP}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Nhập Email của bạn</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="VD: admin@pharmova.com" />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0ea5e9', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Nhận mã OTP</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Mã OTP (6 số)</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="VD: 123456" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Mật khẩu mới</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Ít nhất 6 ký tự" />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Đổi mật khẩu</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Shield, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: 'Đang tải...',
    email: 'Đang tải...',
    phone: 'Đang tải...',
    role: 'Đang tải...'
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res: any = await axiosClient.get('/api/users/profile');
        
        // SỬA LỖI Ở ĐÂY: Quét chuẩn data theo cấu hình axiosClient của đại ca
        let userData = res.data !== undefined ? res.data : res;
        
        if (userData && userData.data) {
          userData = userData.data;
        } else if (userData && userData.user) {
          userData = userData.user;
        }
        
        const savedRole = localStorage.getItem('user_role');

        setProfile({
          fullName: userData?.fullName || userData?.name || 'Chưa cập nhật',
          email: userData?.email || 'Chưa cập nhật',
          phone: userData?.phoneNumber || userData?.phone || 'Chưa cập nhật',
          role: userData?.role?.name || savedRole || 'Nhân viên (Staff)'
        });
      } catch (error) {
        console.error('Lỗi tải hồ sơ', error);
      }
    };
    
    fetchMyProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.put('/api/auth/profile', profile);
      alert('Đã cập nhật thông tin cá nhân thành công!');
    } catch (error: any) {
      alert('Lỗi cập nhật: ' + (error.response?.data?.message || 'Chưa kết nối được Backend hoặc API chưa sẵn sàng!'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp. Vui lòng nhập lại!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      await axiosClient.put('/api/auth/change-password', {
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      alert('Đổi mật khẩu thành công! Vui lòng dùng mật khẩu mới cho lần đăng nhập sau.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || 'Chưa kết nối được Backend hoặc API chưa sẵn sàng!'));
    }
  };

  return (
    <>
      <style>
        {`
          .elegant-font {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .custom-input {
            width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #d1d5db; box-sizing: border-box;
            transition: all 0.2s; font-size: 14px; background-color: #f9fafb; color: #111827;
          }
          .custom-input:focus { border-color: #10b981; background-color: #fff; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
          .pass-wrap { position: relative; }
          .pass-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #6b7280; cursor: pointer; }
          .pass-icon:hover { color: #059669; }
        `}
      </style>

      <div className="elegant-font" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Hồ Sơ Của Tôi</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Quản lý thông tin và bảo mật tài khoản</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Cột trái: Thông tin hiển thị */}
          <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', textAlign: 'center', height: 'fit-content' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 16px', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)' }}>
              {profile.fullName !== 'Đang tải...' && profile.fullName !== 'Chưa cập nhật' ? profile.fullName.split(' ').pop()?.[0]?.toUpperCase() : 'U'}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>{profile.fullName}</h2>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#059669', margin: '0 0 24px 0', fontWeight: '600', fontSize: '14px' }}>
              <Shield size={16} /> {profile.role}
            </p>
            <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#4b5563' }}>
                <Mail size={18} /> <span style={{ fontSize: '14px' }}>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
                <Phone size={18} /> <span style={{ fontSize: '14px' }}>{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Form cập nhật */}
          <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Cập nhật thông tin */}
            <div style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 24px 0', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                <User size={20} color="#059669" /> Thông Tin Cơ Bản
              </h3>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Họ và tên</label>
                    <input type="text" className="custom-input" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Chức vụ</label>
                    <input type="text" className="custom-input" value={profile.role} disabled style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email</label>
                    <input type="email" className="custom-input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required disabled style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Số điện thoại</label>
                    <input type="text" className="custom-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                    <Save size={18} /> Lưu Thông Tin
                  </button>
                </div>
              </form>
            </div>

            {/* Đổi mật khẩu */}
            <div style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 24px 0', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                <Lock size={20} color="#059669" /> Đổi Mật Khẩu
              </h3>
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mật khẩu hiện tại</label>
                  <div className="pass-wrap">
                    <input type={showCurrent ? "text" : "password"} className="custom-input" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required placeholder="Nhập mật khẩu cũ..." />
                    {showCurrent ? <EyeOff size={18} className="pass-icon" onClick={() => setShowCurrent(false)} /> : <Eye size={18} className="pass-icon" onClick={() => setShowCurrent(true)} />}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mật khẩu mới</label>
                    <div className="pass-wrap">
                      <input type={showNew ? "text" : "password"} className="custom-input" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required placeholder="Ít nhất 6 ký tự..." />
                      {showNew ? <EyeOff size={18} className="pass-icon" onClick={() => setShowNew(false)} /> : <Eye size={18} className="pass-icon" onClick={() => setShowNew(true)} />}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Xác nhận mật khẩu mới</label>
                    <div className="pass-wrap">
                      <input type={showConfirm ? "text" : "password"} className="custom-input" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} required placeholder="Nhập lại mật khẩu mới..." />
                      {showConfirm ? <EyeOff size={18} className="pass-icon" onClick={() => setShowConfirm(false)} /> : <Eye size={18} className="pass-icon" onClick={() => setShowConfirm(true)} />}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(17, 24, 39, 0.2)' }}>
                    <Lock size={18} /> Cập Nhật Mật Khẩu
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
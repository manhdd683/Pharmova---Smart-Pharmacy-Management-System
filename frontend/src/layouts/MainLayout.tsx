import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// ĐÃ THÊM: Import thêm icon ShieldAlert cho mục Nhật ký hệ thống
import { LayoutDashboard, ShoppingCart, Package, Archive, Truck, Users, FileText, Tag, BarChart2, ShieldCheck, Bell, LogOut, Search, Layers, Send, Receipt, ShieldAlert } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import axiosClient from '../services/axiosClient'; 
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendTarget, setSendTarget] = useState('all'); 
  const [targetUserId, setTargetUserId] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [usersList, setUsersList] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Cấu hình menu và phân quyền
  const allMenuItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} />, roles: ['Admin'] },
    { name: 'Bán hàng (POS)', path: '/admin/pos', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <Receipt size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Sản phẩm', path: '/admin/products', icon: <Package size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Danh mục', path: '/admin/categories', icon: <Layers size={20} />, roles: ['Admin'] },
    { name: 'Tồn kho', path: '/admin/inventory', icon: <Archive size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Nhập hàng', path: '/admin/imports', icon: <Truck size={20} />, roles: ['Admin'] },
    { name: 'Khách hàng', path: '/admin/customers', icon: <Users size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Đơn thuốc kê', path: '/admin/prescriptions', icon: <FileText size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Khuyến mãi', path: '/admin/vouchers', icon: <Tag size={20} />, roles: ['Admin', 'Staff'] },
    { name: 'Báo cáo', path: '/admin/reports', icon: <BarChart2 size={20} />, roles: ['Admin'] },
    { name: 'Nhân viên & Quyền', path: '/admin/employees', icon: <ShieldCheck size={20} />, roles: ['Admin'] },
    // --- ĐÃ THÊM: Mục Nhật ký hệ thống ---
    { name: 'Nhật ký hệ thống', path: '/admin/audit-logs', icon: <ShieldAlert size={20} />, roles: ['Admin'] },
  ];

  const userRoleName = localStorage.getItem('user_role') || currentUser?.role?.name || 'Staff'; 
  const allowedMenuItems = allMenuItems.filter(item => item.roles.includes(userRoleName));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/api/users/profile');
        const userData = res.data !== undefined ? res.data : res;
        setCurrentUser(userData);
      } catch (error) {
        console.error('Không lấy được thông tin User', error);
        handleLogout();
      }
    };

    fetchProfile();
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSendModal && usersList.length === 0) {
      const fetchUsers = async () => {
        let finalItems: any[] = [];
        try {
          const res1: any = await axiosClient.get('/api/users');
          const data1 = res1.data !== undefined ? res1.data : res1;
          if (Array.isArray(data1)) finalItems = data1;
          else if (Array.isArray(data1?.data)) finalItems = data1.data;
          else if (Array.isArray(data1?.items)) finalItems = data1.items;
        } catch (e) {
          console.log('Ngõ /api/users không khả dụng, thử ngõ tiếp theo...');
        }

        if (finalItems.length === 0) {
          try {
            const res2: any = await axiosClient.get('/api/employees');
            const data2 = res2.data !== undefined ? res2.data : res2;
            if (Array.isArray(data2)) finalItems = data2;
            else if (Array.isArray(data2?.data)) finalItems = data2.data;
            else if (Array.isArray(data2?.items)) finalItems = data2.items;
          } catch (e) {
            console.log('Ngõ /api/employees không khả dụng.');
          }
        }
        setUsersList(finalItems);
      };
      fetchUsers();
    }
  }, [showSendModal]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      const notiList = Array.isArray(data) ? data : (data?.data || []);
      setNotifications(notiList);
    } catch (error) {
      console.log('Chưa tải được thông báo', error);
      setNotifications([]);
    }
  };

  const handleReadNoti = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => (prev || []).map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.log('Lỗi cập nhật thông báo', error);
    }
  };

  const handleSendNotification = async () => {
    if (!sendTitle.trim() || !sendMessage.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung!');
      return;
    }
    if (sendTarget === 'one' && !targetUserId) {
      alert('Vui lòng chọn một nhân viên để gửi!');
      return;
    }
    try {
      setIsSending(true);
      const payload = {
        title: sendTitle,
        message: sendMessage,
        ...(sendTarget === 'one' ? { userId: targetUserId } : {})
      };
      await notificationService.send(payload);
      alert('Gửi thông báo thành công! Dữ liệu đã được lưu vào Database.');
      setShowSendModal(false);
      setSendTitle('');
      setSendMessage('');
      setTargetUserId('');
      fetchNotifications();
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi thông báo!');
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      alert(`Đang tìm kiếm từ khóa: "${searchQuery}"`);
    }
  };

  const unreadCount = (notifications || []).filter(n => !n?.isRead).length;

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><LayoutDashboard size={28} fill="currentColor" /></div>
          <span>Pharmova</span>
        </div>
        
        <div className="sidebar-menu">
          {allowedMenuItems.map((item) => (
            <div 
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </div>

       <div style={{ marginTop: 'auto', borderTop: '1px solid #1f2937', paddingTop: '15px', paddingBottom: '20px' }}>
          <div className="menu-item" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã hóa đơn, tên thuốc, khách hàng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="user-profile">
            {userRoleName === 'Admin' && (
              <div 
                onClick={() => setShowSendModal(true)}
                style={{ cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', marginRight: '15px', backgroundColor: '#e0f2fe', borderRadius: '6px', color: '#0284c7', transition: 'background 0.2s' }}
                title="Soạn thông báo mới"
              >
                <Send size={16} style={{ marginRight: '6px' }}/>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Gửi thông báo</span>
              </div>
            )}

            <div ref={dropdownRef} style={{ position: 'relative', marginRight: '10px' }}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ position: 'relative', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={22} color="#4b5563" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '4px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {showDropdown && (
                <div style={{ position: 'absolute', right: '-60px', top: '45px', width: '340px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                    Thông báo
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {(notifications || []).length === 0 ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Bạn không có thông báo nào.</div>
                    ) : (
                      (notifications || []).map(noti => (
                        <div 
                          key={noti.id} 
                          onClick={() => handleReadNoti(noti.id, noti.isRead)}
                          style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', backgroundColor: noti.isRead ? 'white' : '#f0fdf4', transition: 'background-color 0.2s' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <span style={{ fontWeight: noti.isRead ? '500' : '700', color: '#111827', fontSize: '14px' }}>{noti.title}</span>
                            {!noti.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginTop: '4px', flexShrink: 0 }}></span>}
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>{noti.message}</p>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginTop: '6px' }}>
                            {new Date(noti.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/admin/profile')}
              title="Xem hồ sơ cá nhân"
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {currentUser?.fullName || 'Người dùng'}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {userRoleName}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet /> 
        </div>
      </main>

      {showSendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', width: '450px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>Tạo thông báo mới</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Tiêu đề</label>
              <input 
                type="text" 
                value={sendTitle}
                onChange={(e) => setSendTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nội dung</label>
              <textarea 
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Gửi đến</label>
              <select 
                value={sendTarget}
                onChange={(e) => {
                  setSendTarget(e.target.value);
                  setTargetUserId(''); 
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', marginBottom: sendTarget === 'one' ? '10px' : '0' }}
              >
                <option value="all">Tất cả nhân viên hệ thống</option>
                <option value="one">Một cá nhân cụ thể</option>
              </select>
              
              {sendTarget === 'one' && (
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {usersList.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.name || user.username || 'Người dùng'} - {user.email || user.phoneNumber || 'Không có thông tin'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={() => setShowSendModal(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSendNotification}
                disabled={isSending}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: '500' }}
              >
                {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
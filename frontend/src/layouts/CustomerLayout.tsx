import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, User, LogOut, UserCircle, Bell } from 'lucide-react';
import Footer from '../components/footer/Footer';
import axiosClient from '../services/axiosClient';

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    }

    const handleSync = () => {
      if (localStorage.getItem('access_token')) fetchData();
    };
    
    window.addEventListener('syncData', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('syncData', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [location.pathname, isLoggedIn]);

  const fetchData = async () => {
    try {
      const cartRes: any = await axiosClient.get('/api/carts');
      const cartData = cartRes.data || cartRes;
      if (cartData && cartData.items) {
        const totalItems = cartData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      setCartCount(0);
    }

    try {
      const userRes: any = await axiosClient.get('/api/users/profile');
      const myId = userRes.data?.id || userRes.id;

      const notiRes: any = await axiosClient.get('/api/notifications');
      const notiData = notiRes.data || notiRes;
      const allNotis = Array.isArray(notiData) ? notiData : [];

      const myNotis = allNotis.filter(n => n.userId === myId);
      setNotifications(myNotis);
    } catch (error) {
      console.log('Không thể tải thông báo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setCartCount(0);
    setNotifications([]);
    navigate('/');
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => axiosClient.put(`/api/notifications/${n.id}/read`))
      );
    } catch (error) {
      console.log('Lỗi khi cập nhật trạng thái thông báo');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
          html, body, #root { margin: 0 !important; padding: 0 !important; font-family: 'Nunito', sans-serif !important; background-color: #f8fafc !important; height: auto !important; min-height: 100vh !important; overflow-x: hidden !important; overflow-y: auto !important; }
          * { box-sizing: border-box; }
          a { text-decoration: none; }
          .notif-scroll::-webkit-scrollbar { width: 6px; }
          .notif-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
          .notif-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}
      </style>

      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={28} color="#10b981" />
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Pharmova</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {isLoggedIn ? (
              <>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569', position: 'relative' }}>
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div style={{ position: 'absolute', top: '40px', right: '-50px', width: '340px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden' }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Thông báo</h4>
                        <span onClick={markAllAsRead} style={{ fontSize: '13px', color: '#10b981', cursor: 'pointer', fontWeight: '600' }}>Đánh dấu đã đọc</span>
                      </div>
                      
                      <div className="notif-scroll" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Không có thông báo nào</div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', backgroundColor: notif.isRead ? 'white' : '#ecfdf5', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <h5 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: notif.isRead ? '600' : '800' }}>{notif.title}</h5>
                                {!notif.isRead && <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }}></span>}
                              </div>
                              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{notif.message}</p>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : notif.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <Link to="/profile" onClick={() => setShowNotifications(false)} style={{ fontSize: '13px', color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>Xem toàn bộ thông báo</Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '700', fontSize: '15px', position: 'relative' }}>
                  <ShoppingCart size={20} />
                  <span>Giỏ hàng</span>
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-8px', left: '12px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '700', fontSize: '15px' }}>
                  <UserCircle size={20} color="#10b981" />
                  <span>Hồ sơ</span>
                </Link>

                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '700' }}>
                <User size={18} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerLayout;
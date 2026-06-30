import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Award, Edit2, Lock, Save, X, Package } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import axiosClient from '../../services/axiosClient';

const CustomerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'points'>('profile');
  const [customerData, setCustomerData] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '', address: '', email: '' });

  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchRealData();
  }, []);

  // LẤY DỮ LIỆU NGƯỜI DÙNG (ĐÃ FIX LỖI AXIOS .DATA)
  const fetchRealData = async () => {
    setLoading(true);
    try {
      const profileRes: any = await customerService.getProfile();
      const userRes = profileRes?.data || profileRes;
      let finalData = { ...userRes };

      if (userRes && (userRes.phoneNumber || userRes.phone)) {
        try {
          const custRes: any = await customerService.getCustomerByPhone(userRes.phoneNumber || userRes.phone);
          const customerRes = custRes?.data || custRes;
          if (customerRes) finalData = { ...finalData, ...customerRes };
        } catch (error) { }
      }
      
      const pts = finalData.rewardPoints !== undefined ? finalData.rewardPoints : (finalData.points || 0);
      finalData.rewardPoints = pts;
      setCustomerData(finalData);
      
      setEditForm({
        fullName: finalData.fullName || '',
        phoneNumber: finalData.phoneNumber || finalData.phone || '',
        address: finalData.address || '',
        email: finalData.email || '' 
      });

      // Lấy lịch sử đơn hàng
      try {
        const ordersRes: any = await axiosClient.get('/api/orders/my-orders');
        const myOrders = ordersRes?.data || ordersRes;
        setOrderHistory(Array.isArray(myOrders) ? myOrders : []);
      } catch (err) { 
        setOrderHistory([]); 
      }

    } catch (error) {
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (editForm.email && !editForm.email.includes('@')) {
      alert('Vui lòng nhập đúng định dạng Email!');
      return;
    }
    try {
      await customerService.updateMyProfile(editForm);
      alert('Cập nhật thông tin thành công!');
      setIsEditing(false);
      fetchRealData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    try {
      await customerService.changeMyPassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      alert('Đổi mật khẩu thành công!');
      setIsChangingPw(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#10b981' }}>Đang tải thông tin hồ sơ...</div>;
  if (!customerData) return <div style={{ textAlign: 'center', padding: '100px' }}>Không tìm thấy thông tin tài khoản!</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%', display: 'flex', gap: '24px' }}>
      <div style={{ width: '260px', flexShrink: 0 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '24px', fontWeight: '800' }}>
              {customerData.fullName ? customerData.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{customerData.fullName}</h3>
              <span style={{ fontSize: '13px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '100px' }}>Thành viên</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => { setActiveTab('profile'); setIsChangingPw(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'profile' ? '#ecfdf5' : 'transparent', color: activeTab === 'profile' ? '#10b981' : '#475569', fontSize: '15px', fontWeight: activeTab === 'profile' ? '700' : '500', cursor: 'pointer', textAlign: 'left' }}>
              <User size={20} /> Thông tin cá nhân
            </button>
            <button onClick={() => { setActiveTab('orders'); setIsChangingPw(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'orders' ? '#ecfdf5' : 'transparent', color: activeTab === 'orders' ? '#10b981' : '#475569', fontSize: '15px', fontWeight: activeTab === 'orders' ? '700' : '500', cursor: 'pointer', textAlign: 'left' }}>
              <ShoppingBag size={20} /> Lịch sử mua hàng
            </button>
            <button onClick={() => { setActiveTab('points'); setIsChangingPw(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'points' ? '#ecfdf5' : 'transparent', color: activeTab === 'points' ? '#10b981' : '#475569', fontSize: '15px', fontWeight: activeTab === 'points' ? '700' : '500', cursor: 'pointer', textAlign: 'left' }}>
              <Award size={20} /> Điểm thưởng Pharmova
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', minHeight: '400px' }}>
          
          {activeTab === 'profile' && !isChangingPw && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', color: '#0f172a', margin: 0 }}>Hồ sơ của tôi</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!isEditing ? (
                    <>
                      <button onClick={() => setIsChangingPw(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                        <Lock size={16} /> Đổi mật khẩu
                      </button>
                      <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                        <Edit2 size={16} /> Chỉnh sửa
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                        <X size={16} /> Hủy
                      </button>
                      <button onClick={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                        <Save size={16} /> Lưu lại
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ width: '150px', color: '#64748b', fontSize: '15px' }}>Họ và tên</div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} /> : <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{customerData.fullName}</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ width: '150px', color: '#64748b', fontSize: '15px' }}>Số điện thoại</div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? <input type="text" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} /> : <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{customerData.phoneNumber || customerData.phone || 'Chưa cập nhật'}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ width: '150px', color: '#64748b', fontSize: '15px' }}>Email</div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} /> : <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{customerData.email || 'Chưa cập nhật'}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '16px' }}>
                  <div style={{ width: '150px', color: '#64748b', fontSize: '15px' }}>Địa chỉ</div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} /> : <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{customerData.address || 'Chưa cập nhật'}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && isChangingPw && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', color: '#0f172a', margin: 0 }}>Đổi mật khẩu</h2>
                <button onClick={() => setIsChangingPw(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                  <X size={16} /> Quay lại
                </button>
              </div>
              <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="password" placeholder="Mật khẩu hiện tại" value={pwForm.oldPassword} onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="password" placeholder="Mật khẩu mới" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="password" placeholder="Nhập lại mật khẩu mới" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button onClick={handleChangePassword} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Xác nhận đổi</button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && ( 
            <div>
              <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 24px 0' }}>Lịch sử mua hàng</h2>
              {orderHistory.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                  <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                  Chưa có đơn hàng nào.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orderHistory.map((order: any, idx: number) => (
                    <div key={order.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '800', color: '#1e293b' }}>Mã ĐH: #{order.id?.substring(0,8).toUpperCase()}</span>
                        <span style={{ color: '#059669', fontWeight: '700', backgroundColor: '#d1fae5', padding: '4px 12px', borderRadius: '100px', fontSize: '13px' }}>
                          {order.status || 'Hoàn thành'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>Thanh toán: {order.paymentMethod || 'Tiền mặt'}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                          {Number(order.totalAmount || 0).toLocaleString()} đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> 
          )}
          
          {activeTab === 'points' && ( 
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Award size={48} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 8px 0' }}>Điểm thưởng Pharmova</h2>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#f59e0b' }}>
                {customerData.rewardPoints || 0} <span style={{ fontSize: '20px' }}>Pts</span>
              </div>
              <p style={{ color: '#64748b', marginTop: '16px' }}>Điểm thưởng có thể dùng để giảm giá trực tiếp ở bước Thanh toán.</p>
            </div> 
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
import React, { useState, useEffect } from 'react';
import { Search, Eye, X,  ShoppingCart } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res: any = await axiosClient.get('/api/orders');
      const data = res.data || res || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách hóa đơn", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await axiosClient.put(`/api/orders/${orderId}/status`, { status: newStatus });
      alert(`Đã cập nhật trạng thái thành: ${newStatus}`);
      fetchOrders(); 
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>
        {`
          .elegant-font { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        `}
      </style>
      <div className="elegant-font" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Quản lý Đơn hàng</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Theo dõi và xử lý các đơn đặt hàng từ hệ thống</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 16px', backgroundColor: '#f9fafb' }}>
              <Search size={20} color="#9ca3af" />
              <input type="text" placeholder="Tìm kiếm mã đơn hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', backgroundColor: 'transparent' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Mã Đơn</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Khách Hàng</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Thời Gian</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Tổng Tiền</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Trạng Thái</th> 
                  <th style={{ padding: '16px', fontWeight: '600', textAlign: 'center' }}>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Đang tải dữ liệu...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy đơn hàng nào</td></tr>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <tr key={order.id || idx} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                        #{order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        {order.user?.fullName || 'Khách tại quầy'}
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#059669', fontSize: '15px' }}>
                        {Number(order.totalAmount || 0).toLocaleString()} ₫
                      </td>
                      
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={order.status || 'Chờ xử lý'}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: 
                              order.status === 'Chờ xử lý' ? '#fef3c7' : 
                              order.status === 'Đang giao' ? '#e0f2fe' : 
                              order.status === 'Hoàn thành' ? '#d1fae5' : '#fee2e2',
                            color: 
                              order.status === 'Chờ xử lý' ? '#d97706' : 
                              order.status === 'Đang giao' ? '#0284c7' : 
                              order.status === 'Hoàn thành' ? '#059669' : '#dc2626',
                            outline: 'none'
                          }}
                        >
                          {/* ĐÃ XÓA SẠCH ICON THEO YÊU CẦU */}
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>

                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          <Eye size={16} /> Xem
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '0', borderRadius: '16px', width: '550px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ padding: '24px 32px 20px', borderBottom: '1px dashed #e5e7eb', position: 'relative' }}>
                <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '24px', right: '32px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Mã Đơn Hàng</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>#{selectedOrder.id?.substring(0, 8).toUpperCase()}</div>
                </div>
              </div>

              <div style={{ padding: '24px 32px', borderBottom: '1px dashed #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Khách hàng:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{selectedOrder.user?.fullName || 'Khách tại quầy'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Thanh toán:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{selectedOrder.paymentMethod || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Ngày đặt:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#f9fafb' }}>
                <div style={{ fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={18}/> Danh sách sản phẩm
                </div>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>{item.product?.name || 'Sản phẩm không xác định'}</div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>{Number(item.price).toLocaleString()} ₫ x {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                        {(Number(item.price) * item.quantity).toLocaleString()} ₫
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Không có chi tiết sản phẩm</div>
                )}
              </div>

              <div style={{ padding: '24px 32px', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>TỔNG THANH TOÁN:</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{Number(selectedOrder.totalAmount || 0).toLocaleString()} ₫</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default OrdersPage;
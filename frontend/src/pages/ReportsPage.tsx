import React, { useState, useEffect } from 'react';
import { DollarSign, Receipt, Package, TrendingUp, AlertTriangle, CheckCircle, Calendar, Download, Filter, Users, Eye, X } from 'lucide-react';
import { reportService } from '../services/report.service'; 
import axiosClient from '../services/axiosClient'; 

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = (startDate && endDate) ? { startDate, endDate } : undefined;
      const response: any = await reportService.getDashboardData(params);
      
      let reportData = response.data || response;

      // --- FIX LỖI TÊN KHÁCH HÀNG: ĐỒNG BỘ CHÉO TỪ KHO HÓA ĐƠN ---
      try {
        const ordersRes: any = await axiosClient.get('/api/orders');
        const allOrders = ordersRes.data || ordersRes;
        
        if (Array.isArray(allOrders) && reportData.recentOrders) {
          reportData.recentOrders = reportData.recentOrders.map((ro: any) => {
            // Tìm đơn hàng tương ứng bên kho Orders (nơi đã có tên khách)
            const matchedOrder = allOrders.find((o: any) => o.id === ro.id);
            if (matchedOrder && matchedOrder.user) {
              // Ép luôn tên khách thật vào dữ liệu báo cáo
              return { ...ro, user: matchedOrder.user, customerName: matchedOrder.user.fullName }; 
            }
            return ro;
          });
        }
      } catch (err) {
        console.log("Lỗi đồng bộ chéo tên khách hàng");
      }
      // -----------------------------------------------------------

      setData(reportData);
    } catch (err: any) {
      console.error("Lỗi lấy báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderSummary: any) => {
    setSelectedOrder(orderSummary); 
    try {
      const res: any = await axiosClient.get('/api/orders');
      const allOrders = res.data || res;
      if (Array.isArray(allOrders)) {
        const fullDetail = allOrders.find((o: any) => o.id === orderSummary.id);
        if (fullDetail) {
          setSelectedOrder(fullDetail); 
        }
      }
    } catch (err) {
      console.error("Không thể lấy chi tiết sản phẩm", err);
    }
  };

  const handleExportExcel = () => {
    if (!data || !data.recentOrders || data.recentOrders.length === 0) {
      alert("Không có dữ liệu hóa đơn để xuất!");
      return;
    }

    let csvContent = "Mã Hóa Đơn,Khách Hàng,Ngày Bán,Tổng Tiền\n";
    
    data.recentOrders.forEach((order: any) => {
      const date = new Date(order.createdAt).toLocaleString('vi-VN');
      const amount = order.totalAmount || 0;
      // Ưu tiên xuất tên thật ra Excel
      const cName = order.user?.fullName || order.customerName || 'Khách tại quầy';
      csvContent += `"${order.id}","${cName}","${date}","${amount}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_DoanhThu_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', paddingBottom: '40px', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Báo cáo & Thống kê</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Phân tích và theo dõi hoạt động kinh doanh</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '4px 12px' }}>
            <Calendar size={18} color="#6b7280" style={{ marginRight: '8px' }} />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', color: '#4b5563', fontSize: '14px' }} />
            <span style={{ margin: '0 8px', color: '#9ca3af' }}>-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', color: '#4b5563', fontSize: '14px' }} />
          </div>
          
          <button onClick={fetchReportData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#0f766e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Filter size={18} /> Lọc dữ liệu
          </button>

          <button onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#4b5563' }}>Đang tải dữ liệu báo cáo...</div>
      ) : data?.overview ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#059669' }}><DollarSign size={24} /></div>
                <h3 style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'normal' }}>Tổng Doanh Thu</h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(data.overview.totalRevenue)}</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}><Receipt size={24} /></div>
                <h3 style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'normal' }}>Hóa Đơn Đã Xuất</h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.overview.totalInvoices} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>hóa đơn</span></div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}><Package size={24} /></div>
                <h3 style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'normal' }}>Phiếu Nhập Hàng</h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.overview.totalImportOrders} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>phiếu</span></div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}><TrendingUp size={24} /></div>
                <h3 style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'normal' }}>Tổng Chi Phí Nhập</h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(data.overview.totalImportCost)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#4b5563" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Chi Tiết Hóa Đơn</h3>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                      <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>MÃ HD</th>
                      <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>KHÁCH HÀNG</th>
                      <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>NGÀY BÁN</th>
                      <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>TỔNG TIỀN</th>
                      <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders && data.recentOrders.length > 0 ? (
                      data.recentOrders.map((item: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '13px' }}>#{item.id?.substring(0, 6).toUpperCase() || 'N/A'}</td>
                          <td style={{ padding: '12px 20px', color: '#111827', fontWeight: '500' }}>
                            {/* Ưu tiên hiển thị tên đã đồng bộ */}
                            {item.customerName || item.user?.fullName || 'Khách tại quầy'}
                          </td>
                          <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                          <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(item.totalAmount)}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleViewOrder(item)} 
                              style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Chưa có hóa đơn nào trong khoảng thời gian này.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {data.reconciliation && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Đối soát Hóa Đơn & Sản phẩm</h3>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px dashed #e5e7eb' }}>
                    <span style={{ color: '#4b5563' }}>Tổng số hóa đơn đã tạo:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{data.reconciliation.ordersCount || 0}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px dashed #e5e7eb' }}>
                    <span style={{ color: '#4b5563' }}>Tổng số hộp/vỉ thuốc xuất kho:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{data.reconciliation.itemsSold || 0}</span>
                  </div>

                  <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '8px', backgroundColor: data.reconciliation.isMatching ? '#d1fae5' : '#fee2e2', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {data.reconciliation.isMatching ? (
                      <>
                        <CheckCircle color="#059669" size={24} style={{ flexShrink: 0 }}/>
                        <div>
                          <strong style={{ color: '#047857', display: 'block', marginBottom: '4px' }}>Khớp dữ liệu!</strong>
                          <span style={{ color: '#065f46', fontSize: '13px' }}>100% hóa đơn sinh ra đều có chi tiết bán thuốc rõ ràng, không có hóa đơn ảo.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle color="#dc2626" size={24} style={{ flexShrink: 0 }}/>
                        <div>
                          <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>Cảnh báo sai lệch!</strong>
                          <span style={{ color: '#991b1b', fontSize: '13px' }}>Hệ thống phát hiện có hóa đơn bị rỗng chi tiết thuốc hoặc lỗi đồng bộ. Hãy kiểm tra lại!</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', border: '1px dashed #d1d5db', borderRadius: '12px', color: '#6b7280' }}>
          Hệ thống đang chờ dữ liệu đầu tiên. Hãy tạo hóa đơn để xem báo cáo.
        </div>
      )}

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Tra cứu Hóa Đơn</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '20px 32px', backgroundColor: '#fff', borderBottom: '1px dashed #d1d5db' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Mã Hóa Đơn</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', letterSpacing: '1px' }}>#{selectedOrder.id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Khách hàng:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    {selectedOrder.customerName || selectedOrder.user?.fullName || 'Khách tại quầy'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Ngày lập:</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#f9fafb' }}>
              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} /> Chi tiết sản phẩm mua
              </div>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>{item.product?.name || 'Sản phẩm không xác định'}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>{Number(item.price).toLocaleString('vi-VN')} ₫ x {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                      {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '13px', fontStyle: 'italic' }}>
                  Không có chi tiết sản phẩm (Đơn hàng cũ hoặc dữ liệu trống).
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>TỔNG THANH TOÁN:</span>
                <span style={{ fontWeight: '800', color: '#059669', fontSize: '24px' }}>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsPage;
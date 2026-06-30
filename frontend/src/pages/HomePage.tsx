import React, { useState, useEffect } from 'react';
import { ShoppingBag, AlertTriangle, Users, Package, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../services/axiosClient';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrdersToday: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalProducts: 0,
    nearExpiryCount: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersInfo, productsInfo, customersInfo]: any = await Promise.all([
          axiosClient.get('/api/orders').catch(() => []),
          axiosClient.get('/api/products').catch(() => []),
          axiosClient.get('/api/customers').catch(() => [])
        ]);

        const orders = Array.isArray(ordersInfo) ? ordersInfo : [];
        const products = Array.isArray(productsInfo) ? productsInfo : [];
        const customers = Array.isArray(customersInfo) ? customersInfo : [];

        const todayStr = new Date().toISOString().split('T')[0];
        
        const todayOrders = orders.filter((o: any) => o.createdAt && String(o.createdAt).startsWith(todayStr));
        const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
        
        const lowStockCount = products.filter((p: any) => Number(p.stock) < 15).length;
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);
        const nearExpiryCount = products.filter((p: any) => p.expiryDate && new Date(p.expiryDate) <= targetDate).length;

        setStats({
          todayRevenue,
          totalOrdersToday: todayOrders.length,
          lowStockCount,
          totalCustomers: customers.length,
          totalProducts: products.length,
          nearExpiryCount
        });

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const revenueByDate = last7Days.map(date => {
          const dailyOrders = orders.filter((o: any) => o.createdAt && String(o.createdAt).startsWith(date));
          const dailyRevenue = dailyOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
          const [, month, day] = date.split('-');
          return { name: `${day}/${month}`, DoanhThu: dailyRevenue };
        });

        setChartData(revenueByDate);

        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setRecentOrders(sortedOrders.slice(0, 5));

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Tổng quan</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Báo cáo doanh thu và hoạt động kinh doanh</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Doanh thu hôm nay</span>
            <div style={{ padding: '6px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}><TrendingUp size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.todayRevenue.toLocaleString()} ₫</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Đơn hàng hôm nay</span>
            <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><ShoppingBag size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.totalOrdersToday} <span style={{fontSize: '13px', fontWeight: 'normal', color: '#6b7280'}}>đơn</span></div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Tổng Khách hàng</span>
            <div style={{ padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}><Users size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.totalCustomers} <span style={{fontSize: '13px', fontWeight: 'normal', color: '#6b7280'}}>thành viên</span></div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Tổng sản phẩm</span>
            <div style={{ padding: '6px', backgroundColor: '#f3e8ff', borderRadius: '8px', color: '#a855f7' }}><Package size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.totalProducts} <span style={{fontSize: '13px', fontWeight: 'normal', color: '#6b7280'}}>sản phẩm</span></div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Thuốc sắp hết</span>
            <div style={{ padding: '6px', backgroundColor: '#fff7ed', borderRadius: '8px', color: '#f97316' }}><AlertTriangle size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f97316' }}>{stats.lowStockCount} <span style={{fontSize: '13px', fontWeight: 'normal', color: '#6b7280'}}>sắp cạn kho</span></div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Thuốc cận Date</span>
            <div style={{ padding: '6px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}><AlertCircle size={18} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>{stats.nearExpiryCount} <span style={{fontSize: '13px', fontWeight: 'normal', color: '#6b7280'}}>cần chú ý</span></div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        <div style={{ flex: '1.8', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Biểu đồ Doanh thu (7 ngày)</h3>
          {/* ĐÃ VÁ LỖI Ở ĐÂY: Dùng chartData.length thay vì stats.chartData.length */}
          {chartData.length === 0 ? (
            <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Chưa có dữ liệu bán hàng</div>
          ) : (
            <div style={{ height: '340px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} dx={-5} />
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString()} ₫`, 'Doanh thu']} />
                  <Line type="monotone" dataKey="DoanhThu" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ flex: '1.2', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#3b82f6" /> Đơn hàng mới thanh toán
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>Chưa có giao dịch nào</div>
            ) : (
              recentOrders.map((order: any, idx: number) => (
                <div key={order.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      #{order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Không rõ thời gian'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                    {Number(order.totalAmount || 0).toLocaleString()} ₫
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
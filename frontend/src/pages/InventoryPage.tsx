import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const InventoryPage: React.FC = () => {
  // Các state chính
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lowStock' | 'nearExpiry'>('lowStock');

  // Khởi tạo dữ liệu
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data: any = await axiosClient.get('/api/products');
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, []);

  // Lọc dữ liệu theo tiêu chí
  const lowStockProducts = products.filter(p => p.stock < 15);
  
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + 30);
  const nearExpiryProducts = products.filter(p => p.expiryDate && new Date(p.expiryDate) <= targetDate);

  // Giao diện (Render)
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Quản lý Tồn kho</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Theo dõi thuốc sắp cạn kho và cận Date</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('lowStock')} style={{ padding: '10px 16px', borderRadius: '8px', border: activeTab !== 'lowStock' ? '1px solid #e5e7eb' : 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: activeTab === 'lowStock' ? '#fef2f2' : 'white', color: activeTab === 'lowStock' ? '#ef4444' : '#6b7280' }}>
          <AlertTriangle size={18} /> Sắp hết hàng ({lowStockProducts.length})
        </button>
        <button onClick={() => setActiveTab('nearExpiry')} style={{ padding: '10px 16px', borderRadius: '8px', border: activeTab !== 'nearExpiry' ? '1px solid #e5e7eb' : 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: activeTab === 'nearExpiry' ? '#fff7ed' : 'white', color: activeTab === 'nearExpiry' ? '#f97316' : '#6b7280' }}>
          <Clock size={18} /> Cận Date ({nearExpiryProducts.length})
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>TÊN SẢN PHẨM</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>MÃ SKU</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>TỒN KHO</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>HẠN SỬ DỤNG</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'lowStock' ? lowStockProducts : nearExpiryProducts).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{p.name}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{p.sku}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 'bold', color: p.stock < 15 ? '#ef4444' : '#10b981' }}>{p.stock}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#f97316', fontWeight: 'bold' }}>{p.expiryDate ? p.expiryDate.split('T')[0] : 'Không rõ'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
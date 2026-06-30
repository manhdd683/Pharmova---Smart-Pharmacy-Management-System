import React, { useState, useEffect } from 'react';
import { ShoppingCart, ShieldCheck, Truck, Clock, Star, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ĐÃ THÊM: Import điều hướng
import axiosClient from '../../services/axiosClient'; 

const CustomerHomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate(); // ĐÃ THÊM: Khởi tạo biến điều hướng

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (search: string = '') => {
    try {
      const res: any = await axiosClient.get('/api/products');
      let data = res.data || res || [];
      if (!Array.isArray(data)) data = [];

      if (search.trim() !== '') {
        const lowerSearch = search.toLowerCase();
        data = data.filter((p: any) => 
          p.name?.toLowerCase().includes(lowerSearch) || 
          p.sku?.toLowerCase().includes(lowerSearch)
        );
      }

      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setProducts([]); 
    }
  };

  const handleSearch = () => {
    loadProducts(searchQuery);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      
      {/* Banner */}
      <div style={{ backgroundColor: '#ecfdf5', borderRadius: '20px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#064e3b', margin: '0 0 12px 0', lineHeight: '1.3' }}>Y tế chính hãng, <br/> Giao nhanh tận nhà</h1>
          <p style={{ fontSize: '14px', color: '#047857', margin: '0 0 20px 0', lineHeight: '1.5', opacity: 0.9 }}>Tra cứu thuốc, đặt hàng và nhận sự tư vấn tận tình từ đội ngũ dược sĩ chuyên môn cao của Pharmova ngay hôm nay.</p>
          
          <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#94a3b8' }}><Search size={18} /></div>
            <input 
              type="text" 
              placeholder="Nhập tên thuốc cần tìm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#334155' }} 
            />
            <button onClick={handleSearch} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Tìm kiếm</button>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '180px', height: '180px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png" alt="Pharmacy" style={{ width: '100px', opacity: 0.9 }} />
          </div>
        </div>
      </div>

      {/* Khối tiện ích */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', marginBottom: '32px', marginTop: '20px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '12px' }}><ShieldCheck size={20} color="#15803d" /></div>
          <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>100% Chính hãng</h4></div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '12px' }}><Truck size={20} color="#15803d" /></div>
          <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Giao nhanh 2H</h4></div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '12px' }}><Clock size={20} color="#15803d" /></div>
          <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Dược sĩ tư vấn</h4></div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Sản phẩm nổi bật</h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Xem tất cả <ArrowRight size={14} /></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px' }}>
            Không tìm thấy sản phẩm nào trong cửa hàng.
          </div>
        ) : (
          products.map((product) => {
            const displayImg = product.imageUrl ? `http://localhost:8080${product.imageUrl}` : 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Pharmova';
            
            return (
              <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', backgroundColor: '#f8fafc', position: 'relative' }}>
                  <img 
                    src={displayImg} 
                    alt={product.name} 
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Pharmova'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{product.rating || '5.0'}</span>
                </div>
                
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0', lineHeight: '1.5', minHeight: '42px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.name}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <div style={{ color: '#10b981', fontWeight: '800', fontSize: '16px' }}>
                      {Number(product.price || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  
                  {/* --- ĐÃ FIX: LỘT MẶT NẠ LỖI VÀ CHUYỂN HƯỚNG NẾU CHƯA ĐĂNG NHẬP --- */}
                  <button 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      
                      // 1. Kiểm tra Token trước
                      const token = localStorage.getItem('access_token');
                      if (!token) {
                        alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ!');
                        navigate('/login');
                        return;
                      }

                      // 2. Gọi API thêm vào giỏ
                      try {
                        await axiosClient.post('/api/carts/items', { productId: product.id, quantity: 1 });
                        alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
                      } catch (error: any) {
                        console.error('Lỗi khi thêm giỏ hàng:', error);
                        // Bóc tách chính xác lỗi Backend trả về để hiển thị
                        const errorMsg = error.response?.data?.message || error.message || 'Lỗi server không xác định';
                        alert(`Không thể thêm vào giỏ. Chi tiết lỗi: ${errorMsg}`);
                      }
                    }}
                    style={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerHomePage;
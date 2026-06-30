import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    sku: '', 
    name: '', 
    category: '', 
    price: 0, 
    stock: 0,
    imageUrl: '' 
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const [prodRes, catRes]: any = await Promise.all([
        axiosClient.get('/api/products').catch(() => []),
        axiosClient.get('/api/categories').catch(() => []) 
      ]);
      
      const prodData = prodRes.data || prodRes || [];
      const catData = catRes.data || catRes || [];

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (p?: any) => {
    setImageFile(null); 
    if (p) {
      setEditId(p.id);
      const categoryName = p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : '';
      setFormData({ 
        sku: p.sku || '', 
        name: p.name || '', 
        category: categoryName, 
        price: p.price || 0, 
        stock: p.stock || 0,
        imageUrl: p.imageUrl ? `http://localhost:8080${p.imageUrl}` : '' 
      });
    } else {
      setEditId(null);
      setFormData({ sku: '', name: '', category: '', price: 0, stock: 0, imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Đại ca chọn ảnh nhẹ thôi (dưới 2MB) để hệ thống chạy mượt nhé!');
        return;
      }
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // ĐÃ FIX LỖI Ở ĐÂY: KHÔNG GỬI TÊN DANH MỤC TEXT, MÀ GỬI ID DANH MỤC
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('sku', formData.sku);
      submitData.append('name', formData.name);
      submitData.append('price', String(formData.price));
      submitData.append('stock', String(formData.stock));
      
      // Dò tên danh mục xem có khớp với DB không, nếu có thì lấy ID gửi đi
      const matchedCategory = categories.find(c => c.name === formData.category);
      if (matchedCategory) {
        submitData.append('categoryId', matchedCategory.id);
      }
      // Lưu ý: Tuyệt đối không append('category', text) vì sẽ làm sập Backend

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editId) {
        await axiosClient.put(`/api/products/${editId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosClient.post('/api/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      loadData(); 
    } catch (error: any) {
      alert('Có lỗi xảy ra khi lưu! Backend đang từ chối dữ liệu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Đại ca có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await axiosClient.delete(`/api/products/${id}`);
      loadData();
    } catch (error) {
      alert('Lỗi khi xóa!');
    }
  };

  return (
    <>
      <style>
        {`
          .elegant-font { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          .custom-input { width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #d1d5db; box-sizing: border-box; transition: all 0.2s; font-size: 14px; background-color: #f9fafb; }
          .custom-input:focus { border-color: #10b981; background-color: #fff; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
          .img-thumbnail { width: 48px; height: 48px; border-radius: 8px; object-fit: contain; border: 1px solid #e5e7eb; background-color: #fff; padding: 2px; }
          .upload-box { border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; background-color: #f9fafb; transition: all 0.2s; cursor: pointer; }
          .upload-box:hover { border-color: #10b981; background-color: #ecfdf5; }
        `}
      </style>

      <div className="elegant-font" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Quản lý Sản phẩm</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Danh sách thuốc và dược phẩm trong hệ thống</p>
          </div>
          <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 16px', backgroundColor: '#f9fafb' }}>
              <Search size={20} color="#9ca3af" />
              <input type="text" placeholder="Tìm kiếm mã thuốc, tên thuốc..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', backgroundColor: 'transparent' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Mã Thuốc</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Sản Phẩm</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Danh Mục</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Giá Bán</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Trạng Thái</th>
                  <th style={{ padding: '16px', fontWeight: '600', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => {
                  const categoryDisplay = p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : 'Chưa phân loại';
                  const displayImg = p.imageUrl ? `http://localhost:8080${p.imageUrl}` : '';

                  return (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                        {p.sku || `SP${p.id?.substring(0, 8).toUpperCase()}`}
                      </td>
                      
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {displayImg ? (
                            <img src={displayImg} alt={p.name} className="img-thumbnail" />
                          ) : (
                            <div className="img-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{p.name}</span>
                        </div>
                      </td>
                      
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>{categoryDisplay}</td>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#059669', fontSize: '15px' }}>
                        {Number(p.price || 0).toLocaleString()} ₫
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', backgroundColor: p.stock > 10 ? '#d1fae5' : '#fee2e2', color: p.stock > 10 ? '#047857' : '#b91c1c' }}>
                          {p.stock > 10 ? `Còn hàng (${p.stock})` : `Sắp hết (${p.stock})`}
                        </span>
                      </td>
                      <td style={{ padding: '16px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <button onClick={() => openModal(p)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#3b82f6', cursor: 'pointer' }} title="Sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' }} title="Xóa"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>{editId ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: '#6b7280' }}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Hình ảnh sản phẩm</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                  
                  {formData.imageUrl ? (
                    <div style={{ position: 'relative', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', backgroundColor: '#f9fafb' }}>
                      <img src={formData.imageUrl} alt="Preview" style={{ maxHeight: '160px', objectFit: 'contain', borderRadius: '8px' }} />
                      <button type="button" onClick={() => { setFormData({...formData, imageUrl: ''}); setImageFile(null); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }} title="Xóa ảnh">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud size={32} color="#10b981" style={{ marginBottom: '12px' }} />
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Bấm vào đây để tải ảnh lên</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Hỗ trợ JPG, PNG (Tối đa 2MB)</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mã SKU</label>
                    <input type="text" className="custom-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="VD: PARA500" />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tên sản phẩm *</label>
                    <input type="text" className="custom-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Thuốc Paracetamol 500mg" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Giá bán (₫) *</label>
                    <input type="number" className="custom-input" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tồn kho *</label>
                    <input type="number" className="custom-input" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Danh mục</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    list="category-options"
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    placeholder="Chọn danh mục có sẵn..." 
                    autoComplete="off"
                  />
                  <datalist id="category-options">
                    {categories.map((cat: any, index: number) => (
                      <option key={cat.id || index} value={cat.name} />
                    ))}
                  </datalist>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Hủy Bỏ</button>
                  <button type="submit" style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#059669', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>{editId ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
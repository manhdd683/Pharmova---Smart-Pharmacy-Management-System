import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/category.service';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, id?: string) => void;
  productToEdit?: any;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    sku: '', name: '', price: 0, unit: 'Hộp', stock: 0, categoryId: '', description: '', expiryDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const data: any = await categoryService.getCategories();
          setCategories(data);
        } catch (error) {
          console.error("Lỗi tải danh mục");
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormData({
          sku: productToEdit.sku || '',
          name: productToEdit.name || '',
          price: productToEdit.price || 0,
          unit: productToEdit.unit || 'Hộp',
          stock: productToEdit.stock || 0,
          categoryId: productToEdit.category?.id || productToEdit.categoryId || '',
          description: productToEdit.description || '',
          expiryDate: productToEdit.expiryDate ? productToEdit.expiryDate.split('T')[0] : ''
        });
      } else {
        setFormData({ sku: '', name: '', price: 0, unit: 'Hộp', stock: 0, categoryId: '', description: '', expiryDate: '' });
      }
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, productToEdit?.id);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>
          {productToEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Mã thuốc / SKU *</label>
            <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Tên sản phẩm *</label>
            <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Danh mục</label>
            <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          {/* Ô chọn Ngày hết hạn thuốc */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Ngày hết hạn (Hạn dùng)</label>
            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Mô tả / Công dụng</label>
            <textarea rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontFamily: 'inherit' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Giá bán</label>
              <input type="number" min="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Đơn vị tính</label>
              <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Số lượng tồn kho</label>
            <input type="number" min="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
            <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
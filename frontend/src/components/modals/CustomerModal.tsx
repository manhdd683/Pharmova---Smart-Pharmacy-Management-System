import React, { useState, useEffect } from 'react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, id?: string) => void;
  customerToEdit?: any;
  initialPhone?: string; // Nhận số điện thoại gõ dở từ POS truyền sang
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, customerToEdit, initialPhone }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    rewardPoints: 0, 
    membershipTier: 'Đồng' 
  });

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        // Trường hợp Sửa: Đổ dữ liệu khách cũ vào form
        setFormData({
          fullName: customerToEdit.fullName || '',
          phone: customerToEdit.phone || '',
          rewardPoints: customerToEdit.rewardPoints || 0,
          membershipTier: customerToEdit.membershipTier || 'Đồng'
        });
      } else {
        // Trường hợp Thêm Mới: Tự động điền initialPhone vào ô SĐT
        setFormData({ 
          fullName: '', 
          phone: initialPhone || '', 
          rewardPoints: 0, 
          membershipTier: 'Đồng' 
        });
      }
    }
  }, [isOpen, customerToEdit, initialPhone]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, customerToEdit?.id);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>
          {customerToEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Tên khách hàng *</label>
            <input 
              type="text" 
              required
              placeholder="VD: Nguyễn Văn A"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoFocus={!customerToEdit} // Tự động trỏ chuột vào ô Tên khi thêm mới
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Số điện thoại *</label>
            <input 
              type="tel" 
              required
              placeholder="VD: 0987654321"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {customerToEdit && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Điểm tích lũy</label>
                <input 
                  type="number" 
                  min="0"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: Number(e.target.value) })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Hạng thẻ</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  value={formData.membershipTier}
                  onChange={(e) => setFormData({ ...formData, membershipTier: e.target.value })}
                >
                  <option value="Đồng">Đồng</option>
                  <option value="Bạc">Bạc</option>
                  <option value="Vàng">Vàng</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Hủy
            </button>
            <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              {customerToEdit ? 'Lưu thay đổi' : 'Tạo khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
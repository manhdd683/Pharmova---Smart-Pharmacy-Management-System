import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Ticket, X, AlertCircle } from 'lucide-react';
import { voucherService } from '../services/voucher.service';

const VouchersPage: React.FC = () => {
  // STATE DỮ LIỆU & MODAL
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  const defaultForm = {
    id: '', code: '', description: '', discountType: 'VND', 
    discountValue: '', minOrder: '', expiryDate: '', status: 'Đang hoạt động'
  };
  const [formData, setFormData] = useState<any>(defaultForm);

  // LẤY DỮ LIỆU & LỌC
  const fetchVouchers = async () => {
    try {
      const response: any = await voucherService.getAll();
      setVouchers(response.data || response);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Voucher:", error);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    let result = vouchers;
    if (searchTerm) {
      result = result.filter(v => v.code?.toLowerCase().includes(searchTerm.toLowerCase()) || v.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus !== 'Tất cả') {
      result = result.filter(v => v.status === filterStatus);
    }
    setFilteredData(result);
  }, [searchTerm, filterStatus, vouchers]);

  // XỬ LÝ MỞ FORM
  const openAddForm = () => { setFormData(defaultForm); setIsFormOpen(true); };
  
  const openEditForm = (item: any) => { 
    let formattedDate = '';
    const rawDate = item.expirationDate || item.expiryDate || item.expiration_date;
    if (rawDate) {
      formattedDate = new Date(rawDate).toISOString().split('T')[0];
    }

    setFormData({ 
      ...item,
      id: item.id || item.voucherId || item.voucher_id,
      discountType: item.discountType || item.discount_type,
      discountValue: item.discountAmount || item.discountValue || item.discount_value,
      minOrder: item.minOrder || item.min_order,
      expiryDate: formattedDate
    }); 
    setIsFormOpen(true); 
  };

  const openDelete = (item: any) => { setCurrentRecord(item); setIsDeleteOpen(true); };

  // XỬ LÝ LƯU THÊM/SỬA
  const handleSaveForm = async () => {
    try {
      // Gói dữ liệu gửi đi khớp với cấu trúc Database
      const dataToSend = {
        code: formData.code,
        description: formData.description,
        status: formData.status,
        discountType: formData.discountType,
        minOrder: Number(formData.minOrder || 0),
        
        // Cập nhật đúng tên cột discountAmount và giới hạn mặc định
        discountAmount: Number(formData.discountValue || 0),
        usageLimit: 0,
        
        expirationDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      };

      if (formData.id) {
        await voucherService.update(formData.id, dataToSend);
        alert("Cập nhật thành công!");
      } else {
        await voucherService.create(dataToSend);
        alert("Thêm mới thành công!");
      }
      
      setIsFormOpen(false);
      fetchVouchers(); 
      
    } catch (error: any) {
      console.error("Lỗi chi tiết:", error);
      const errorData = error.response?.data;
      const backendMessage = errorData?.message || errorData?.error || error.message || "Lỗi 500 Server";
      const finalMessage = Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage;
      
      alert(`Backend từ chối nhận vì lỗi:\n\n${finalMessage}`);
    }
  };

  // XỬ LÝ XÓA
  const confirmDelete = async () => {
    try {
      const recordId = currentRecord.id || currentRecord.voucherId || currentRecord.voucher_id;
      if(!recordId) {
         alert("Lỗi: Không tìm thấy ID để xóa!"); return;
      }

      await voucherService.delete(recordId);
      setIsDeleteOpen(false);
      fetchVouchers();
      alert("Xóa thành công!");
    } catch (error: any) {
      alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  // GIAO DIỆN HIỂN THỊ
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Khuyến mãi & Voucher</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Quản lý các chương trình giảm giá</p>
        </div>
        <button onClick={openAddForm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px 12px 0 0', border: '1px solid #e5e7eb', borderBottom: 'none', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input type="text" placeholder="Tìm kiếm mã code, mô tả..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 16px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}>
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Sắp diễn ra">Sắp diễn ra</option>
          <option value="Đã kết thúc">Đã kết thúc</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e5e7eb', overflow: 'hidden', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>MÃ VOUCHER</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>MÔ TẢ</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>MỨC GIẢM</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>ĐƠN TỐI THIỂU</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>HẠN SỬ DỤNG</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px', color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const rawDate = item.expirationDate || item.expiryDate || item.expiration_date;
              const displayDate = rawDate ? new Date(rawDate).toLocaleDateString('vi-VN') : 'Không giới hạn';
              const displayVal = item.discountAmount || item.discountValue || item.discount_value;
              const displayMin = item.minOrder || item.min_order;
              const displayType = item.discountType || item.discount_type;

              return (
                <tr key={item.id || item.code} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}><Ticket size={18} /> {item.code}</td>
                  <td style={{ padding: '16px', color: '#111827', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#059669' }}>
                    {displayType === 'PERCENT' ? `${displayVal}%` : formatCurrency(displayVal)}
                  </td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{formatCurrency(displayMin)}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{displayDate}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: item.status === 'Đang hoạt động' ? '#d1fae5' : item.status === 'Sắp diễn ra' ? '#fef3c7' : '#f3f4f6',
                      color: item.status === 'Đang hoạt động' ? '#047857' : item.status === 'Sắp diễn ra' ? '#b45309' : '#4b5563'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <button onClick={() => openEditForm(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} title="Sửa"><Edit size={20} /></button>
                      <button onClick={() => openDelete(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Xóa"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredData.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Không tìm thấy mã khuyến mãi nào!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '600px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setIsFormOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#6b7280" /></button>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>{formData.id ? 'Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Mã Voucher *</label>
                <input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: SALE10K" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Trạng thái</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Sắp diễn ra">Sắp diễn ra</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Mô tả chương trình</label>
                <input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="VD: Giảm giá nhân dịp khai trương..." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Loại giảm giá</label>
                <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="VND">Giảm theo số tiền (VNĐ)</option>
                  <option value="PERCENT">Giảm theo phần trăm (%)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Mức giảm</label>
                <input type="number" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} placeholder="VD: 10000" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Đơn tối thiểu (VNĐ)</label>
                <input type="number" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: e.target.value})} placeholder="VD: 100000" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Hạn sử dụng</label>
                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsFormOpen(false)} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
              <button onClick={handleSaveForm} style={{ padding: '10px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu khuyến mãi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÓA */}
      {isDeleteOpen && currentRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '400px', padding: '24px', textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ marginTop: 0, fontSize: '20px' }}>Xác nhận xóa?</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn có chắc chắn muốn xóa mã <strong>{currentRecord.code}</strong> không? Hành động này không thể hoàn tác.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setIsDeleteOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VouchersPage;
import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit, Trash2, Search, UserPlus, X, Stethoscope } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Thêm state để biết là đang Thêm mới hay đang Sửa
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: 'Thu ngân',
    password: ''
  });

  // Lấy dữ liệu từ Database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data: any = await axiosClient.get('/api/employees');
        setEmployees(data);
      } catch (err) {
        setError('Không thể kết nối đến máy chủ hoặc chưa đăng nhập!');
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.phoneNumber?.includes(searchTerm)
  );

  // Mở Form Thêm mới
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ fullName: '', phoneNumber: '', email: '', role: 'Thu ngân', password: '' });
    setIsModalOpen(true);
  };

  // Mở Form Sửa và điền sẵn dữ liệu cũ
  const handleOpenEditModal = (emp: any) => {
    setEditingId(emp.id); // Lưu ID để lát biết mà gọi API Update
    setFormData({
      fullName: emp.fullName || '',
      phoneNumber: emp.phoneNumber || '',
      email: emp.email || '',
      role: emp.role || 'Thu ngân',
      password: '' // Bỏ trống password, nếu người dùng nhập thì mới đổi
    });
    setIsModalOpen(true);
  };

  // Thêm hoặc Cập nhật nhân viên
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // GỌI API CẬP NHẬT
        await axiosClient.put(`/api/employees/${editingId}`, formData);
        
        // Cập nhật lại danh sách hiển thị
        setEmployees(employees.map(emp => 
          emp.id === editingId 
            ? { ...emp, fullName: formData.fullName, phoneNumber: formData.phoneNumber, email: formData.email, role: formData.role }
            : emp
        ));
        alert('Cập nhật nhân viên thành công!');
      } else {
        // GỌI API THÊM MỚI
        const response: any = await axiosClient.post('/api/employees', formData);
        setEmployees([...employees, response]);
        alert('Thêm nhân viên thành công!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Xóa nhân viên khỏi DB
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await axiosClient.delete(`/api/employees/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Lỗi khi xóa nhân viên!');
      }
    }
  };

  // Chọn icon hiển thị tùy theo Role
  const getRoleIcon = (role: string) => {
    if (role === 'Admin') return <Shield size={14} />;
    if (role === 'Dược sĩ') return <Stethoscope size={14} />;
    return <Users size={14} />;
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Nhân viên & Quyền</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Quản lý tài khoản và phân quyền truy cập hệ thống</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <UserPlus size={18} /> Thêm nhân viên
        </button>
      </div>

      {error ? (
        <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{error}</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1, maxWidth: '400px' }}>
              <Search size={18} color="#6b7280" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên hoặc SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>NHÂN VIÊN</th>
                  <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>SỐ ĐIỆN THOẠI</th>
                  <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>VAI TRÒ</th>
                  <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 'bold' }}>
                          {emp.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{emp.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', fontSize: '14px' }}>{emp.phoneNumber}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', backgroundColor: emp.role === 'Admin' ? '#fef2f2' : emp.role === 'Dược sĩ' ? '#fffbeb' : '#f0fdf4', color: emp.role === 'Admin' ? '#ef4444' : emp.role === 'Dược sĩ' ? '#d97706' : '#16a34a' }}>
                        {getRoleIcon(emp.role)}
                        {emp.role || 'Thu ngân'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: emp.isActive !== false ? '#10b981' : '#ef4444', marginRight: '6px' }}></span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{emp.isActive !== false ? 'Hoạt động' : 'Đã khóa'}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {/* ĐÃ GẮN SỰ KIỆN onClick CHO NÚT SỬA */}
                        <button onClick={() => handleOpenEditModal(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              {/* ĐỔI TIÊU ĐỀ DỰA TRÊN TRẠNG THÁI */}
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{editingId ? 'Sửa Thông Tin' : 'Thêm Nhân Viên Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Họ và tên *</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Số điện thoại (Tên đăng nhập) *</label>
                {/* NẾU ĐANG SỬA THÌ KHÔNG CHO ĐỔI SĐT ĐỂ TRÁNH LỖI */}
                <input required disabled={!!editingId} type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: editingId ? '#f3f4f6' : 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div>
                {/* NẾU LÀ SỬA THÌ BÁO LÀ KHÔNG BẮT BUỘC NHẬP */}
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Mật khẩu {editingId ? '(Để trống nếu không đổi)' : '*'}</label>
                <input required={!editingId} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phân quyền</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="Thu ngân">Thu ngân (Chỉ bán hàng)</option>
                  {/* ĐÃ THÊM CHỨC NĂNG DƯỢC SĨ */}
                  <option value="Dược sĩ">Dược sĩ (Tư vấn, kê đơn)</option> 
                  <option value="Admin">Quản trị viên (Toàn quyền)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
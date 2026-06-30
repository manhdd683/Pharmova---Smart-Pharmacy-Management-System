import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { customerService } from '../services/customer.service';
import CustomerModal from '../components/modals/CustomerModal';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      const data: any = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Không thể tải danh sách khách hàng.');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSaveCustomer = async (formData: any, id?: string) => {
    try {
      if (id) {
        await customerService.updateCustomer(id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu khách hàng!");
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ khách hàng này?")) {
      try {
        await customerService.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert("Lỗi khi xóa khách hàng!");
      }
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Quản lý Khách hàng</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Theo dõi thông tin và điểm tích lũy</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} /> Thêm khách hàng
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{error}</p>}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Tên khách hàng</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Số điện thoại</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Hạng thẻ</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Điểm tích lũy</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Chưa có dữ liệu khách hàng.</td>
              </tr>
            ) : (
              customers.map((cus) => (
                <tr key={cus.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{cus.fullName}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{cus.phone}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: cus.membershipTier === 'Vàng' ? '#fef08a' : cus.membershipTier === 'Bạc' ? '#f3f4f6' : '#ffedd5',
                      color: cus.membershipTier === 'Vàng' ? '#854d0e' : cus.membershipTier === 'Bạc' ? '#374151' : '#9a3412'
                    }}>
                      {cus.membershipTier}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{cus.rewardPoints}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(cus)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(cus.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCustomer} 
        customerToEdit={editingCustomer} 
      />
    </div>
  );
};

export default CustomersPage;
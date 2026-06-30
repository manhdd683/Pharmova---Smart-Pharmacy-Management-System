import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/category.service';
import { Plus, Edit, Trash2 } from 'lucide-react'; // Bổ sung icon Edit và Trash2
import CategoryModal from '../components/modals/CategoryModal';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null); // MỚI: State lưu data khi bấm Sửa

  // Tải danh sách danh mục
  const fetchCategories = async () => {
    try {
      const data: any = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Không thể tải danh sách danh mục.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý Lưu (Cả Thêm mới và Sửa)
  const handleSaveCategory = async (formData: any, id?: string) => {
    try {
      if (id) {
        await categoryService.updateCategory(id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu danh mục!");
    }
  };

  // Hàm mở form ở chế độ Thêm mới
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Hàm mở form ở chế độ Sửa
  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Xử lý Xóa danh mục
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? (Lưu ý: Các sản phẩm thuộc danh mục này sẽ chuyển về trạng thái 'Chưa phân loại')")) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert("Lỗi khi xóa danh mục!");
      }
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Danh mục Sản phẩm</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Phân loại các nhóm thuốc và thiết bị y tế</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {error ? (
        <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{error}</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Tên danh mục</th>
                <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Mô tả</th>
                <th style={{ padding: '16px 24px', color: '#6b7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Chưa có danh mục nào.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{cat.id.substring(0, 8)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{cat.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{cat.description || '--'}</td>
                    {/* CỘT THAO TÁC */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Gọi Modal và truyền dữ liệu Editing */}
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCategory} 
        categoryToEdit={editingCategory} 
      />
    </div>
  );
};

export default CategoriesPage;
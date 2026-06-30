import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Printer, Upload, X, Plus } from 'lucide-react';
import axiosClient from '../services/axiosClient';
import { importService } from '../services/import.service';
import * as XLSX from 'xlsx';

const ImportPage: React.FC = () => {
  // State quản lý dữ liệu
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [importCart, setImportCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State thông tin phiếu nhập
  const [supplier, setSupplier] = useState('');
  const [deliverer, setDeliverer] = useState('');
  const [importer] = useState('Admin');
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);

  // State in ấn và File Excel
  const [receiptData, setReceiptData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Modal Thêm Thuốc Nhanh
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 });

  // State Modal Thêm Nhà Cung Cấp Nhanh
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '' });

  // Lấy dữ liệu sản phẩm và nhà cung cấp
  const loadData = async () => {
    try {
      const [prodData, suppData] = await Promise.all([
        axiosClient.get('/api/products').catch(() => []),
        axiosClient.get('/api/suppliers').catch(() => [])
      ]);
      setProducts(prodData as any);
      setSuppliers(suppData as any);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Xử lý giỏ hàng nhập kho
  const addToImport = (product: any, qty: number = 1, price?: number) => {
    setImportCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      } else {
        const defaultImportPrice = price || Math.round((product.price * 0.7) / 1000) * 1000;
        return [...prev, { ...product, quantity: qty, importPrice: defaultImportPrice }];
      }
    });
  };

  const handleQuantityChange = (id: string, value: string) => {
    const newQty = parseInt(value) || 0;
    setImportCart(importCart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const updateImportPrice = (id: string, newPrice: number) => {
    setImportCart(importCart.map(item => item.id === id ? { ...item, importPrice: newPrice } : item));
  };

  const removeItem = (id: string) => {
    setImportCart(importCart.filter(item => item.id !== id));
  };

  // Xử lý đọc file Excel
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      let matchCount = 0;
      data.forEach(row => {
        const matchedProduct = products.find(p => p.name.toLowerCase() === (row['Tên thuốc'] || row['Ten thuoc'] || '').toLowerCase());
        if (matchedProduct) {
          addToImport(matchedProduct, parseInt(row['Số lượng'] || row['So luong']) || 1, parseInt(row['Giá nhập'] || row['Gia nhap']));
          matchCount++;
        }
      });
      alert(`Đã nhận diện và thêm thành công ${matchCount} sản phẩm từ file Excel!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const totalImportAmount = importCart.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

  // HÀM TẠO THUỐC MỚI NHANH
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const autoSku = 'SP' + new Date().getTime();

      const payload = {
        ...newProduct,
        sku: autoSku,
        unit: 'Hộp', 
        description: 'Tạo nhanh từ phiếu nhập'
      };

      const response: any = await axiosClient.post('/api/products', payload);
      const createdProduct = response.data || response;

      alert('Đã thêm thuốc mới thành công!');
      setIsAddProductModalOpen(false);
      
      if (newProduct.stock > 0) {
        const realId = createdProduct?.id || crypto.randomUUID(); 
        addToImport({ id: realId, name: newProduct.name, price: newProduct.price, stock: newProduct.stock }, newProduct.stock);
      }
      
      setNewProduct({ name: '', price: 0, stock: 0 });
      loadData(); 
    } catch (error: any) {
      let errorMsg = error.response?.data?.message || 'Có lỗi khi tạo thuốc. Vui lòng thử lại!';
      if (Array.isArray(errorMsg)) errorMsg = errorMsg.join('\n- ');
      alert(`BACKEND TỪ CHỐI TẠO THUỐC:\n- ${errorMsg}`);
    }
  };

  // HÀM TẠO NHÀ CUNG CẤP NHANH
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/suppliers', newSupplier);
      alert('✅ Đã thêm nhà cung cấp mới thành công!');
      setIsAddSupplierModalOpen(false);
      
      // Tự động chọn luôn nhà cung cấp vừa tạo
      setSupplier(newSupplier.name);
      
      setNewSupplier({ name: '', phone: '', email: '', address: '' });
      loadData(); 
    } catch (error: any) {
      alert('❌ Lỗi khi thêm nhà cung cấp. Vui lòng thử lại!');
    }
  };

  // Xử lý hoàn tất phiếu nhập
  const handleCompleteImport = async () => {
    if (importCart.length === 0) return alert('Phiếu nhập đang trống!');
    if (!supplier.trim()) return alert('Vui lòng chọn Nhà cung cấp!');

    try {
      const payload = {
        supplierName: supplier,
        items: importCart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          importPrice: item.importPrice
        })),
        totalAmount: totalImportAmount
      };
      
      await importService.createImport(payload);
      
      setReceiptData({
        importId: 'PNK' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        date: importDate,
        supplier,
        deliverer: deliverer || '......................',
        importer,
        items: [...importCart],
        totalAmount: totalImportAmount
      });

      setImportCart([]);
      setSupplier('');
      setDeliverer('');
      
      loadData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi nhập hàng!');
    }
  };

  // Giao diện
  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-import-receipt, #printable-import-receipt * { visibility: visible; }
            #printable-import-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .modal-overlay {
              position: absolute !important;
              background: transparent !important;
              align-items: flex-start !important;
              padding: 0 !important;
            }
            .modal-content {
              box-shadow: none !important;
              padding: 0 !important;
              width: 100% !important;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Khung tìm kiếm và chọn sản phẩm */}
        <div style={{ flex: 1.2, backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Kho thuốc</h2>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsAddProductModalOpen(true)} style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                Thuốc mới
              </button>
              
              <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                <Upload size={16} /> Nhập Excel
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
            <Search size={18} color="#6b7280" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên thuốc để nhập kho..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => addToImport(p)} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', cursor: 'pointer', backgroundColor: p.stock < 15 ? '#fef2f2' : 'white', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: p.stock < 15 ? '#ef4444' : '#6b7280', fontWeight: p.stock < 15 ? 'bold' : 'normal' }}>
                  Tồn kho: {p.stock} {p.stock < 15 && '(Cần nhập)'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khung phiếu nhập kho */}
        <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb' }}>
             Lập Phiếu Nhập Kho
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            
            {/* ĐÃ CẤY THÊM NÚT CỘNG NHÀ CUNG CẤP Ở ĐÂY */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nhà cung cấp *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={supplier} 
                  onChange={(e) => setSupplier(e.target.value)} 
                  style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: 'white' }}
                >
                  <option value="">-- Chọn Nhà cung cấp --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsAddSupplierModalOpen(true)}
                  style={{ padding: '0 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Thêm nhà cung cấp mới"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Người giao hàng</label>
              <input type="text" placeholder="Tên tài xế / NVKD..." value={deliverer} onChange={(e) => setDeliverer(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Người lập phiếu</label>
              <input type="text" value={importer} readOnly style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f3f4f6' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Ngày nhập</label>
              <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
            {importCart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>Chưa có sản phẩm nào trong phiếu nhập.</div>
            ) : (
              importCart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Tồn hiện tại: {item.stock}</div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#6b7280' }}>Đơn giá nhập (₫)</label>
                    <input type="number" value={item.importPrice} onChange={(e) => updateImportPrice(item.id, Number(e.target.value))} style={{ width: '100px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#6b7280' }}>Số lượng nhập</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
                  </div>

                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#2563eb', width: '100px', textAlign: 'right' }}>
                    {(item.quantity * item.importPrice).toLocaleString()} ₫
                  </div>

                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              <span>Tổng tiền nhập hàng:</span>
              <span style={{ color: '#2563eb' }}>{totalImportAmount.toLocaleString()} ₫</span>
            </div>
            <button onClick={handleCompleteImport} style={{ width: '100%', padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              Hoàn tất & In Phiếu
            </button>
          </div>
        </div>
      </div>

      {/* MODAL TẠO THUỐC MỚI */}
      {isAddProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Tạo Thuốc Mới Nhanh</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Tên thuốc *</label>
                <input type="text" required autoFocus value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} placeholder="VD: Panadol Extra" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Giá bán dự kiến (Đ) *</label>
                <input type="number" required min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>Số hộp (Tồn kho ban đầu) *</label>
                <input type="number" required min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddProductModalOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: '10px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thuốc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM NHÀ CUNG CẤP NHANH */}
      {isAddSupplierModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Thêm Nhà Cung Cấp</h3>
              <button onClick={() => setIsAddSupplierModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateSupplier}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Tên công ty/Đại lý *</label>
                <input type="text" required autoFocus value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} placeholder="VD: Công ty Dược Hậu Giang" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Số điện thoại</label>
                <input type="text" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} placeholder="VD: 0987.654.321" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Địa chỉ</label>
                <input type="text" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} placeholder="VD: Cầu Giấy, Hà Nội" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddSupplierModalOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: '10px', border: 'none', background: '#10b981', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Khung hiển thị Hóa đơn in */}
      {receiptData && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', width: '700px', margin: 'auto' }}>
            
            <div id="printable-import-receipt" style={{ color: '#000', fontSize: '14px', lineHeight: '1.5' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>HỆ THỐNG NHÀ THUỐC PHARMOVA</h2>
                  <p style={{ margin: 0 }}>Đ/c: Số 123, Đường Xuân Thủy, Cầu Giấy, HN</p>
                  <p style={{ margin: 0 }}>Hotline: 0988.123.456</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0 }}>Mẫu số: 01-VT</p>
                  <p style={{ margin: 0 }}>Ký hiệu: PNK/2026</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', textTransform: 'uppercase' }}>PHIẾU NHẬP KHO</h1>
                <p style={{ margin: 0, fontStyle: 'italic' }}>Ngày {receiptData.date.split('-')[2]} tháng {receiptData.date.split('-')[1]} năm {receiptData.date.split('-')[0]}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Số: {receiptData.importId}</p>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>- Đơn vị cung cấp: <strong>{receiptData.supplier}</strong></div>
                <div>- Người giao hàng: <strong>{receiptData.deliverer}</strong></div>
                <div>- Người lập phiếu: <strong>{receiptData.importer}</strong></div>
                <div>- Nhập tại kho: Kho tổng Pharmova</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên thuốc / Vật tư</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ĐVT</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Số lượng</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Hộp</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{item.importPrice.toLocaleString()}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(item.quantity * item.importPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{receiptData.totalAmount.toLocaleString()} ₫</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Người giao hàng</p>
                  <p style={{ fontStyle: 'italic', margin: '0 0 60px 0', fontSize: '12px' }}>(Ký, họ tên)</p>
                  <p>{receiptData.deliverer}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Thủ kho / Người nhận</p>
                  <p style={{ fontStyle: 'italic', margin: '0 0 60px 0', fontSize: '12px' }}>(Ký, họ tên)</p>
                  <p>{receiptData.importer}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Giám đốc</p>
                  <p style={{ fontStyle: 'italic', margin: '0 0 60px 0', fontSize: '12px' }}>(Ký, họ tên, đóng dấu)</p>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '16px', marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <button onClick={() => setReceiptData(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Đóng
              </button>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} /> In Phiếu Nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportPage;
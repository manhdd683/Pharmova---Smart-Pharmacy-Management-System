import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, UserPlus, X, Plus, Minus, Trash2, Printer } from 'lucide-react';
import { customerService } from '../services/customer.service';
import CustomerModal from '../components/modals/CustomerModal';
import axiosClient from '../services/axiosClient';

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // State cho phần tìm kiếm thông minh
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // TẢI DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, customerData] = await Promise.all([
          axiosClient.get('/api/products'),
          customerService.getCustomers()
        ]);
        setProducts(productData as any);
        setCustomers(customerData as any);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu", error);
      }
    };
    loadData();
  }, []);

  // XỬ LÝ GIỎ HÀNG
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id: string) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQuantity = (id: string) => {
    setCart(cart.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // TÍNH TOÁN CHI PHÍ & ĐIỂM THƯỞNG
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const maxPointsCanUse = Math.floor(totalAmount / 1000); 
  const pointsUsed = (usePoints && selectedCustomer) ? Math.min(selectedCustomer.rewardPoints || 0, maxPointsCanUse) : 0;
  const discountAmount = pointsUsed * 1000;
  const finalAmount = totalAmount - discountAmount;

  // QUẢN LÝ KHÁCH HÀNG (ĐÃ FIX LỖI AXIOS BÓC VỎ .DATA)
  const handleSearchCustomer = async (phone: string) => {
    setSearchPhone(phone);
    if (phone.length >= 10) {
      setIsSearching(true);
      try {
        const localMatch = customers.find(c => c.phone === phone || c.phoneNumber === phone);
        if (localMatch) {
          setSelectedCustomer(localMatch);
          setUsePoints(false);
        } else {
          // Bóc vỏ .data ở đây để TypeScript và React hiểu
          const res: any = await customerService.searchUserByPhone(phone);
          const remoteUser = res?.data || res;
          
          if (remoteUser && remoteUser.fullName) {
            setSelectedCustomer({
              ...remoteUser,
              phone: remoteUser.phoneNumber || remoteUser.phone, 
              rewardPoints: remoteUser.rewardPoints || 0,
              membershipTier: remoteUser.membershipTier || 'Thành viên mới'
            });
            setUsePoints(false);
          } else {
            setSelectedCustomer(null);
          }
        }
      } catch (error) {
        setSelectedCustomer(null);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSelectedCustomer(null);
      setUsePoints(false);
    }
  };

  const handleSaveCustomer = async (data: any) => {
    try {
      const newCus: any = await customerService.createCustomer(data);
      setCustomers([...customers, newCus]);
      setSelectedCustomer(newCus);
      setSearchPhone(newCus.phone);
      setIsModalOpen(false);
    } catch (error) {
      alert('Có lỗi khi tạo khách hàng');
    }
  };

  // XỬ LÝ THANH TOÁN
  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Giỏ hàng đang trống!');
    try {
      const payload = {
        cart: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        customerId: selectedCustomer?.id,
        pointsToUse: pointsUsed 
      };
      
      const response: any = await axiosClient.post('/api/products/checkout', payload);
      
      setReceiptData({
        orderId: response.orderId || Math.random().toString(36).substring(2, 10).toUpperCase(),
        date: new Date().toLocaleString('vi-VN'),
        cart: [...cart],
        customer: selectedCustomer,
        totalAmount,
        discountAmount,
        pointsUsed,
        finalAmount,
        pointsEarned: Math.floor(finalAmount / 10000)
      });

      setCart([]);
      setSelectedCustomer(null);
      setSearchPhone('');
      setUsePoints(false);
      
      const updatedProducts = await axiosClient.get('/api/products');
      setProducts(updatedProducts as any);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi thanh toán!');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-receipt, #printable-receipt * { visibility: visible; }
            #printable-receipt { position: absolute; left: 0; top: 0; width: 80mm; padding: 0; margin: 0; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)', fontFamily: 'Inter, sans-serif' }}>
        
        {/* DANH SÁCH SẢN PHẨM */}
        <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '12px', overflowY: 'auto', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>Sản phẩm</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{p.name}</div>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>{Number(p.price).toLocaleString()} ₫</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Tồn: {p.stock}</div>
              </div>
            ))}
          </div>
        </div>

        {/* THÔNG TIN HÓA ĐƠN & GIỎ HÀNG */}
        <div style={{ flex: 1.2, backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} /> Hóa đơn
          </h2>

          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: selectedCustomer ? '12px' : '0' }}>
              <Search size={16} color="#6b7280" />
              <input 
                type="text" 
                placeholder="Nhập SĐT khách hàng (10 số)..." 
                value={searchPhone}
                onChange={(e) => handleSearchCustomer(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            
            {isSearching ? (
              <div style={{ color: '#3b82f6', textAlign: 'center', fontSize: '13px', fontWeight: '600', padding: '8px' }}>
                Đang tìm thông tin khách hàng...
              </div>
            ) : selectedCustomer ? (
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '6px', border: '1px solid #d1fae5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#065f46', fontSize: '14px', marginBottom: '4px' }}>{selectedCustomer.fullName || selectedCustomer.name}</div>
                    <div style={{ fontSize: '13px', color: '#047857' }}>Hạng: <strong>{selectedCustomer.membershipTier || 'Thành viên mới'}</strong> | Điểm: <strong>{selectedCustomer.rewardPoints || 0}</strong></div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setSearchPhone(''); setUsePoints(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
                    <X size={18} />
                  </button>
                </div>
                
                {(selectedCustomer.rewardPoints > 0) && cart.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #a7f3d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="usePoints" 
                      checked={usePoints} 
                      onChange={(e) => setUsePoints(e.target.checked)} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                    />
                    <label htmlFor="usePoints" style={{ fontSize: '13px', color: '#065f46', cursor: 'pointer', userSelect: 'none' }}>
                      Dùng <strong>{Math.min(selectedCustomer.rewardPoints, Math.floor(totalAmount / 1000))}</strong> điểm (Giảm: <strong style={{color: '#ef4444'}}>-{(Math.min(selectedCustomer.rewardPoints, Math.floor(totalAmount / 1000)) * 1000).toLocaleString()} ₫</strong>)
                    </label>
                  </div>
                )}
              </div>
            ) : searchPhone.length >= 10 ? (
              <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '10px', marginTop: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                <UserPlus size={16} /> Thêm khách mới
              </button>
            ) : null}
          </div>

          {/* DANH SÁCH MỤC GIỎ HÀNG */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#111827' }}>{item.name}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => decreaseQuantity(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>
                      <Plus size={14} />
                    </button>
                    <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>x {Number(item.price).toLocaleString()} ₫</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#111827' }}>{(item.quantity * item.price).toLocaleString()} ₫</div>
                  <button onClick={() => removeItem(item.id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* KHỐI TỔNG TIỀN VÀ THANH TOÁN */}
          <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#6b7280' }}>
              <span>Tạm tính:</span>
              <span>{totalAmount.toLocaleString()} ₫</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#ef4444', fontWeight: '500' }}>
                <span>Trừ điểm:</span>
                <span>- {discountAmount.toLocaleString()} ₫</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              <span>Thực thu:</span>
              <span style={{ color: '#10b981' }}>{finalAmount.toLocaleString()} ₫</span>
            </div>
            <button onClick={handleCheckout} style={{ width: '100%', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
              Thanh toán ({finalAmount.toLocaleString()} ₫)
            </button>
          </div>
        </div>
        
        <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCustomer} initialPhone={searchPhone} />
      </div>

      {/* MODAL HIỂN THỊ VÀ IN HÓA ĐƠN ĐÃ CÓ THANH CUỘN */}
      {receiptData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div className="no-print" style={{ backgroundColor: '#d1fae5', border: '1px solid #10b981', color: '#047857', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                Thanh toán thành công
            </div>

            <div id="printable-receipt" style={{ color: '#000', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}>
              <h2 style={{ textAlign: 'center', margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold' }}>PHARMOVA</h2>
              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '12px', color: '#333' }}>
                <div>Đ/c: Số 123, Đường Xuân Thủy, Cầu Giấy, HN</div>
                <div>Hotline: 0988.123.456</div>
              </div>
              
              <p style={{ textAlign: 'center', margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>Hóa đơn bán hàng</p>
              
              <div style={{ marginBottom: '16px', fontSize: '12px', borderBottom: '1px dashed #000', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Số HD:</span> <span>#{receiptData.orderId.substring(0, 8)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ngày:</span> <span>{receiptData.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Thu ngân:</span> <span>Admin</span>
                </div>
                
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dotted #ccc' }}>
                  {receiptData.customer ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Khách hàng:</span> <span>{receiptData.customer.fullName || receiptData.customer.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SĐT:</span> <span>{receiptData.customer.phone || receiptData.customer.phoneNumber}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Khách hàng:</span> <span>Khách lẻ</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                  <span>Tên thuốc</span>
                  <span>Thành tiền</span>
                </div>
                {receiptData.cart.map((item: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                      <span>{item.quantity} x {Number(item.price).toLocaleString()}</span>
                      <span>{(item.quantity * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Tổng cộng:</span>
                <span>{receiptData.totalAmount.toLocaleString()} ₫</span>
              </div>
              {receiptData.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Trừ điểm ({receiptData.pointsUsed}):</span>
                  <span>-{receiptData.discountAmount.toLocaleString()} ₫</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginTop: '8px', borderTop: '1px solid #000', paddingTop: '8px' }}>
                <span>Thanh toán:</span>
                <span>{receiptData.finalAmount.toLocaleString()} ₫</span>
              </div>

              {receiptData.customer && (
                <div style={{ marginTop: '16px', fontSize: '12px', textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '16px' }}>
                  <div>Điểm tích lũy đơn này: +{receiptData.pointsEarned} điểm</div>
                </div>
              )}
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', fontStyle: 'italic' }}>Cảm ơn quý khách. Hẹn gặp lại!</p>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => setReceiptData(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Đóng
              </button>
              <button onClick={printReceipt} style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} /> In Hóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POSPage;
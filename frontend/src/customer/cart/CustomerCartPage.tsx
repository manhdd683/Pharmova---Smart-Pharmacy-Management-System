import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShieldCheck,  Truck, Store,  Banknote, CreditCard, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';

const CustomerCartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  
  const [availablePoints, setAvailablePoints] = useState(0);
  const [useAllPoints, setUseAllPoints] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [dbVouchers, setDbVouchers] = useState<any[]>([]);

  const navigate = useNavigate();

  // KHỞI TẠO DỮ LIỆU
  useEffect(() => {
    const fetchProfileAndVouchers = async () => {
      try {
        const res: any = await axiosClient.get('/api/users/profile');
        const userData = res.data || res;
        
        if (userData) {
          if (userData.address) setShippingAddress(userData.address);
          const points = userData.rewardPoints !== undefined ? userData.rewardPoints : (userData.points || 0);
          setAvailablePoints(points);
        }
      } catch (error) {}

      try {
        const voucherRes: any = await axiosClient.get('/api/vouchers');
        const vData = voucherRes.data || voucherRes || [];
        setDbVouchers(Array.isArray(vData) ? vData : []);
      } catch (error) {}
    };
    
    fetchProfileAndVouchers();
    loadCartFromDB();
  }, []);

  // XỬ LÝ GIỎ HÀNG
  const loadCartFromDB = async () => {
    try {
      const res: any = await axiosClient.get('/api/carts');
      const data = res.data || res;
      setCartItems(data.items || []);
    } catch (error) {
      setCartItems([]);
    } finally { setLoading(false); }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await axiosClient.put(`/api/carts/items/${itemId}`, { quantity: newQuantity });
      await loadCartFromDB(); 
      window.dispatchEvent(new Event('syncData')); 
    } catch (error) {}
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await axiosClient.delete(`/api/carts/items/${itemId}`);
      await loadCartFromDB();
      window.dispatchEvent(new Event('syncData'));
    } catch (error) {}
  };

  // XỬ LÝ KHUYẾN MÃI
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) { alert("Vui lòng chọn hoặc nhập mã giảm giá!"); return; }
    const codeUpper = voucherCode.toUpperCase();
    const foundVoucher = dbVouchers.find(v => v.code?.toUpperCase() === codeUpper);
    if (foundVoucher) {
      setAppliedVoucher({ code: foundVoucher.code, discount: foundVoucher.discountAmount || foundVoucher.discount || foundVoucher.value || 0 });
      alert(`Áp dụng mã ${codeUpper} thành công!`);
    } else {
      alert("Mã giảm giá không tồn tại hoặc đã hết hạn!");
      setAppliedVoucher(null);
    }
  };

  // TÍNH TOÁN ĐƠN HÀNG
  const subTotal = cartItems.reduce((sum, item) => sum + (Number(item.product?.price || 0) * item.quantity), 0);
  const pointsDiscount = useAllPoints ? availablePoints * 1000 : 0; 
  const voucherDiscount = appliedVoucher ? appliedVoucher.discount : 0;
  const finalTotal = Math.max(0, subTotal - pointsDiscount - voucherDiscount);
  const estimatedPoints = Math.floor(finalTotal / 10000); 

  const handleCheckout = async () => {
    if (cartItems.length === 0) { alert("Giỏ hàng đang trống!"); return; }
    if (deliveryMethod === 'shipping' && !shippingAddress.trim()) { alert("Vui lòng nhập địa chỉ nhận hàng!"); return; }
    try {
      const paymentText = paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản';
      const deliveryText = deliveryMethod === 'shipping' ? `Giao tận nơi (${shippingAddress})` : 'Nhận tại quầy';
      const finalPaymentNote = `${paymentText} - ${deliveryText}`;

      await axiosClient.post('/api/orders/checkout', {
        paymentMethod: finalPaymentNote,
        pointsUsed: useAllPoints ? availablePoints : 0,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        voucherDiscount: voucherDiscount 
      });
      
      window.dispatchEvent(new Event('syncData'));
      alert(`Đặt hàng thành công! Bạn được cộng ${estimatedPoints} điểm.`);
      navigate('/profile'); 
    } catch (error: any) { alert('Có lỗi xảy ra khi đặt hàng.'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#10b981', fontWeight: 'bold' }}>Đang tải giỏ hàng...</div>;

  return (
    <>
      <style>
        {` .modern-ui { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
           .modern-ui button, .modern-ui input, .modern-ui textarea, .modern-ui select { font-family: inherit; } `}
      </style>
      <div className="modern-ui" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '24px', fontWeight: '800' }}>Giỏ hàng của bạn</h1>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Giỏ hàng trống</div>
              ) : (
                cartItems.map((item) => {
                  const product = item.product || {};
                  const displayImg = product.imageUrl ? `http://localhost:8080${product.imageUrl}` : 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Pharmova';
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                      <img src={displayImg} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #e2e8f0', padding: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{product.name || 'Sản phẩm'}</h3>
                        <div style={{ color: '#10b981', fontWeight: '800', fontSize: '16px' }}>{Number(product.price || 0).toLocaleString('vi-VN')} đ</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'none', padding: '8px', cursor: 'pointer', color: '#64748b' }}><Minus size={16} /></button>
                          <span style={{ fontSize: '15px', fontWeight: '600', width: '30px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'none', padding: '8px', cursor: 'pointer', color: '#10b981' }}><Plus size={16} /></button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#064e3b' }}>
                <ShieldCheck size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Khai báo Y tế (Tùy chọn)</h3>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#064e3b', marginBottom: '8px' }}>Triệu chứng hiện tại</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="VD: Sốt 39 độ, ho có đờm..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#064e3b', marginBottom: '8px' }}>Tiểu sử bệnh / Dị ứng</label>
                <textarea value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} placeholder="VD: Dị ứng Penicillin, có thai..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Hình thức nhận hàng</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button onClick={() => setDeliveryMethod('shipping')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: deliveryMethod === 'shipping' ? '2px solid #10b981' : '1px solid #e2e8f0', backgroundColor: deliveryMethod === 'shipping' ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: deliveryMethod === 'shipping' ? '#064e3b' : '#64748b', fontWeight: '600' }}>
                  <Truck size={20} color={deliveryMethod === 'shipping' ? '#10b981' : '#94a3b8'} /> Giao tận nơi
                </button>
                <button onClick={() => setDeliveryMethod('pickup')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: deliveryMethod === 'pickup' ? '2px solid #10b981' : '1px solid #e2e8f0', backgroundColor: deliveryMethod === 'pickup' ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: deliveryMethod === 'pickup' ? '#064e3b' : '#64748b', fontWeight: '600' }}>
                  <Store size={20} color={deliveryMethod === 'pickup' ? '#10b981' : '#94a3b8'} /> Nhận tại quầy
                </button>
              </div>
              {deliveryMethod === 'shipping' && (
                <input type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Nhập địa chỉ của bạn..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} />
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Khuyến mãi & Điểm thưởng</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={16} color="#9ca3af" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                  <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Nhập mã..." list="voucher-list" style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} />
                  <datalist id="voucher-list">
                    {dbVouchers.map((v, i) => <option key={i} value={v.code}>{v.description || `Giảm ${Number(v.discountAmount || v.discount || v.value || 0).toLocaleString('vi-VN')}đ`}</option>)}
                  </datalist>
                </div>
                <button onClick={handleApplyVoucher} style={{ padding: '0 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Áp dụng</button>
              </div>
              
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: availablePoints > 0 ? 'pointer' : 'not-allowed' }}>
                  <input 
                    type="checkbox" 
                    checked={useAllPoints}
                    onChange={(e) => setUseAllPoints(e.target.checked)}
                    disabled={availablePoints <= 0}
                    style={{ width: '18px', height: '18px', cursor: availablePoints > 0 ? 'pointer' : 'not-allowed' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    Dùng toàn bộ {availablePoints} điểm thưởng (Giảm {(availablePoints * 1000).toLocaleString('vi-VN')} đ)
                  </span>
                </label>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Phương thức thanh toán</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: paymentMethod === 'cash' ? '2px solid #3b82f6' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'cash' ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Banknote size={20} color={paymentMethod === 'cash' ? '#3b82f6' : '#64748b'} />
                  <span style={{ fontWeight: '600', color: paymentMethod === 'cash' ? '#1e3a8a' : '#334155', fontSize: '13px' }}>Tiền mặt</span>
                </div>
                <div onClick={() => setPaymentMethod('transfer')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: paymentMethod === 'transfer' ? '2px solid #3b82f6' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'transfer' ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color={paymentMethod === 'transfer' ? '#3b82f6' : '#64748b'} />
                  <span style={{ fontWeight: '600', color: paymentMethod === 'transfer' ? '#1e3a8a' : '#334155', fontSize: '13px' }}>Chuyển khoản</span>
                </div>
              </div>
              {paymentMethod === 'transfer' && finalTotal > 0 && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px dashed #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1e3a8a' }}>Quét mã QR để thanh toán nhanh</h4>
                  <img src={`https://img.vietqr.io/image/MB-123456789-compact2.png?amount=${finalTotal}&addInfo=Thanh toan Pharmova&accountName=PHARMOVA`} alt="Mã QR" style={{ width: '180px', height: '180px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white', padding: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Tổng đơn hàng</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#475569' }}><span>Tạm tính</span><span>{subTotal.toLocaleString('vi-VN')} đ</span></div>
              {voucherDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#10b981' }}><span>Voucher</span><span>- {voucherDiscount.toLocaleString('vi-VN')} đ</span></div>}
              {pointsDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#10b981' }}><span>Dùng điểm</span><span>- {pointsDiscount.toLocaleString('vi-VN')} đ</span></div>}
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Thành tiền</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{finalTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <button onClick={handleCheckout} style={{ width: '100%', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' }}>
                Đặt thuốc ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerCartPage;
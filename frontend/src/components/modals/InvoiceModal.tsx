import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  totalAmount: number;
  onComplete: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, cart, totalAmount, onComplete }) => {
  if (!isOpen) return null;

  // Lấy thời gian hiện tại
  const currentDate = new Date().toLocaleString('vi-VN');

  // Lệnh gọi hộp thoại in của trình duyệt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      {/* Cấu hình CSS CSS chỉ dùng cho lúc In */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div id="printable-invoice" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
        
        {/* Nút đóng (Chỉ hiện khi xem, ẩn khi in) */}
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={24} />
        </button>

        {/* HEADER HÓA ĐƠN */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #d1d5db', paddingBottom: '16px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>NHÀ THUỐC PHARMOVA</h2>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#4b5563' }}>Địa chỉ: Khu Công Nghệ Cao Hòa Lạc, Hà Nội</p>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4b5563' }}>Điện thoại: 0123.456.789</p>
          <h3 style={{ margin: 0, fontSize: '18px' }}>HÓA ĐƠN BÁN HÀNG</h3>
        </div>

        {/* THÔNG TIN CHUNG */}
        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ngày in:</span> <strong>{currentDate}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nhân viên:</span> <strong>Dương Đức Mạnh</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mã hóa đơn:</span> <strong>HD-{Math.floor(Date.now() / 1000)}</strong>
          </div>
        </div>

        {/* CHI TIẾT SẢN PHẨM */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #111827', borderTop: '1px solid #111827' }}>
              <th style={{ textAlign: 'left', padding: '8px 0' }}>Tên thuốc</th>
              <th style={{ textAlign: 'center', padding: '8px 0' }}>SL</th>
              <th style={{ textAlign: 'right', padding: '8px 0' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px dashed #d1d5db' }}>
                <td style={{ padding: '8px 0', color: '#111827' }}>{item.name} <br/><span style={{ fontSize: '11px', color: '#6b7280' }}>{item.price.toLocaleString()} ₫/{item.unit}</span></td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: '500' }}>{(item.price * item.quantity).toLocaleString()} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TỔNG KẾT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          <span>TỔNG CỘNG:</span>
          <span>{totalAmount.toLocaleString()} ₫</span>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '24px' }}>
          Cảm ơn quý khách và hẹn gặp lại!
        </div>

        {/* NÚT THAO TÁC (Ẩn khi in) */}
        <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrint} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            <Printer size={18} /> In hóa đơn
          </button>
          <button onClick={onComplete} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            <CheckCircle size={18} /> Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
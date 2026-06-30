import React from 'react';
import { LayoutDashboard, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e2e8f0', paddingTop: '60px', paddingBottom: '24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.5fr', gap: '30px', marginBottom: '50px' }}>

          {/* Cột 1: Thông tin công ty */}
          <div style={{ paddingRight: '20px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <LayoutDashboard size={28} color="#10b981" />
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Pharmova</span>
            </Link>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Hệ thống nhà thuốc trực tuyến uy tín, cung cấp dược phẩm và thiết bị y tế chính hãng với giá tốt nhất. Sức khỏe của bạn là ưu tiên số 1 của chúng tôi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#475569', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                {/* ĐÃ SỬA ĐỊA CHỈ */}
                <span>Thanh Xuân, Hà Nội</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} color="#10b981" /> 1900 6868 (Hỗ trợ 24/7)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} color="#10b981" /> contact@pharmova.com</div>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi (Gắn link động) */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Về Pharmova</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><Link to="/info/about" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Giới thiệu công ty</Link></li>
              <li><Link to="/info/stores" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Hệ thống cửa hàng</Link></li>
              <li><Link to="/info/license" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Giấy phép kinh doanh</Link></li>
              <li><Link to="/info/careers" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Tuyển dụng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng (Gắn link động) */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hỗ trợ khách hàng</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><Link to="/info/returns" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Chính sách đổi trả</Link></li>
              <li><Link to="/info/shipping" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Chính sách giao hàng</Link></li>
              <li><Link to="/info/privacy" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Chính sách bảo mật</Link></li>
              <li><Link to="/info/faq" style={{ color: '#64748b', fontSize: '14px', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => {e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '5px'}} onMouseOut={(e) => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'}}>Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Cột 4: Kết nối */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kết nối với chúng tôi</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', color: '#334155', transition: 'all 0.3s ease' }} onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#1877f2'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-3px)'}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.transform = 'translateY(0)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', color: '#334155', transition: 'all 0.3s ease' }} onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#e1306c'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-3px)'}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.transform = 'translateY(0)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', color: '#334155', transition: 'all 0.3s ease' }} onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#ff0000'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-3px)'}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.transform = 'translateY(0)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

        </div>

        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            <strong style={{ color: '#0f172a' }}>© 2026 Pharmova.</strong>
          </div>
          <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Phát triển bởi: <strong style={{ color: '#0f172a' }}>Dương Đức Mạnh</strong></span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { ShieldCheck, Award, HeartHandshake } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', minHeight: '60vh', width: '100%' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '24px', fontWeight: '800' }}>Về Pharmova</h1>
        
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
          <strong>Pharmova</strong> là hệ thống nhà thuốc trực tuyến uy tín, chuyên cung cấp các sản phẩm dược phẩm, thực phẩm chức năng và thiết bị y tế chính hãng với giá tốt nhất. Với phương châm "Sức khỏe của bạn là ưu tiên số 1", chúng tôi cam kết mang đến cho cộng đồng những sản phẩm chất lượng tốt nhất.
        </p>
        
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', marginBottom: '40px' }}>
          Đội ngũ Dược sĩ của chúng tôi luôn túc trực 24/7 để lắng nghe, tư vấn và đồng hành cùng sức khỏe của gia đình bạn. Tất cả các sản phẩm tại Pharmova đều được kiểm định nghiêm ngặt và có nguồn gốc rõ ràng.
        </p>

        {/* Khối giá trị cốt lõi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '16px' }}>
            <ShieldCheck size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', color: '#064e3b', margin: '0 0 8px 0' }}>100% Chính hãng</h3>
            <p style={{ fontSize: '14px', color: '#047857', margin: 0 }}>Cam kết hoàn tiền nếu phát hiện hàng giả, hàng nhái.</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '16px' }}>
            <Award size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', color: '#064e3b', margin: '0 0 8px 0' }}>Chất lượng cao</h3>
            <p style={{ fontSize: '14px', color: '#047857', margin: 0 }}>Bảo quản thuốc đúng chuẩn GPP của Bộ Y Tế.</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '16px' }}>
            <HeartHandshake size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', color: '#064e3b', margin: '0 0 8px 0' }}>Tận tâm phục vụ</h3>
            <p style={{ fontSize: '14px', color: '#047857', margin: 0 }}>Dược sĩ chuyên môn cao tư vấn miễn phí 24/7.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
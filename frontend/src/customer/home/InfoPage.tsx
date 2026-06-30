import React from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, MapPin, FileText, Briefcase, RefreshCcw, Truck, Lock, HelpCircle } from 'lucide-react';

const InfoPage: React.FC = () => {
  // Bắt tham số từ URL (ví dụ: /info/shipping thì slug = 'shipping')
  const { slug } = useParams<{ slug: string }>();

  // Kho chứa toàn bộ thông tin nội dung
  const contentData: Record<string, any> = {
    'about': {
      title: 'Về Pharmova',
      icon: <ShieldCheck size={32} color="#10b981" />,
      text: (
        <>
          <p><strong>Pharmova</strong> là hệ thống nhà thuốc trực tuyến uy tín, chuyên cung cấp dược phẩm, thực phẩm chức năng và thiết bị y tế chính hãng.</p>
          <p>Với phương châm "Sức khỏe của bạn là ưu tiên số 1", chúng tôi cam kết mang đến những sản phẩm đạt tiêu chuẩn của Bộ Y Tế, cùng dịch vụ dược sĩ tư vấn tận tâm 24/7.</p>
        </>
      )
    },
    'stores': {
      title: 'Hệ thống cửa hàng',
      icon: <MapPin size={32} color="#10b981" />,
      text: (
        <>
          <p>Nhằm tối ưu chi phí và đem lại giá thành rẻ nhất cho khách hàng, Pharmova hiện đang tập trung toàn lực vào kênh phân phối Online.</p>
          <p><strong>Trung tâm vận chuyển & Trụ sở:</strong> Thanh Xuân, Hà Nội.</p>
          <p>Dự kiến trong năm tới, chúng tôi sẽ mở rộng chuỗi nhà thuốc vật lý tại các thành phố lớn.</p>
        </>
      )
    },
    'license': {
      title: 'Giấy phép kinh doanh',
      icon: <FileText size={32} color="#10b981" />,
      text: (
        <>
          <p><strong>CÔNG TY CỔ PHẦN DƯỢC PHẨM PHARMOVA</strong></p>
          <p>- Mã số doanh nghiệp: 0123456789 do Sở KH&ĐT TP. Hà Nội cấp.</p>
          <p>- Giấy chứng nhận đủ điều kiện kinh doanh dược số: 123/ĐKKDD-HN.</p>
          <p>- Giấy chứng nhận đạt Thực hành tốt cơ sở bán lẻ thuốc (GPP).</p>
        </>
      )
    },
    'careers': {
      title: 'Tuyển dụng',
      icon: <Briefcase size={32} color="#10b981" />,
      text: (
        <>
          <p>Pharmova luôn chào đón các nhân tài gia nhập đội ngũ. Chúng tôi đang tuyển dụng các vị trí:</p>
          <ul>
            <li>Dược sĩ tư vấn Online (Full-time / Part-time)</li>
            <li>Nhân viên kho vận & đóng gói</li>
            <li>Chuyên viên Marketing & Phát triển nội dung y tế</li>
          </ul>
          <p>Vui lòng gửi CV về email: <strong>hr@pharmova.com</strong>.</p>
        </>
      )
    },
    'returns': {
      title: 'Chính sách đổi trả',
      icon: <RefreshCcw size={32} color="#10b981" />,
      text: (
        <>
          <p>Pharmova hỗ trợ đổi/trả sản phẩm trong vòng <strong>07 ngày</strong> kể từ khi nhận hàng trong các trường hợp:</p>
          <ul>
            <li>Sản phẩm bị lỗi từ phía nhà sản xuất hoặc dập nát trong quá trình vận chuyển.</li>
            <li>Sản phẩm cận date (dưới 3 tháng) hoặc sai lệch với đơn hàng đã đặt.</li>
          </ul>
          <p><em>Lưu ý: Không áp dụng đổi trả đối với thuốc kê đơn và hàng trữ lạnh (vaccine, insulin...).</em></p>
        </>
      )
    },
    'shipping': {
      title: 'Chính sách giao hàng',
      icon: <Truck size={32} color="#10b981" />,
      text: (
        <>
          <p><strong>Giao hàng hỏa tốc nội thành Hà Nội:</strong> Nhận hàng trong vòng 2H.</p>
          <p><strong>Giao hàng toàn quốc:</strong> Thời gian từ 2-4 ngày làm việc.</p>
          <p>🎁 Miễn phí vận chuyển (Freeship) cho toàn bộ đơn hàng có giá trị từ <strong>300.000đ</strong>.</p>
        </>
      )
    },
    'privacy': {
      title: 'Chính sách bảo mật',
      icon: <Lock size={32} color="#10b981" />,
      text: (
        <>
          <p>Thông tin cá nhân và hồ sơ bệnh án của Quý khách được Pharmova mã hóa và bảo mật tuyệt đối theo tiêu chuẩn y tế.</p>
          <p>Chúng tôi cam kết không mua bán, trao đổi dữ liệu khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
        </>
      )
    },
    'faq': {
      title: 'Câu hỏi thường gặp',
      icon: <HelpCircle size={32} color="#10b981" />,
      text: (
        <>
          <p><strong>1. Pharmova có bán thuốc kê đơn không?</strong></p>
          <p>Có, bạn cần chụp ảnh đơn thuốc của bác sĩ gửi qua Zalo hoặc tải lên hệ thống để dược sĩ kiểm duyệt trước khi mua.</p>
          <p><strong>2. Tôi muốn xuất hóa đơn VAT được không?</strong></p>
          <p>Tất cả sản phẩm tại Pharmova đều hỗ trợ xuất hóa đơn điện tử (VAT) theo quy định.</p>
        </>
      )
    }
  };

  // Lấy nội dung tương ứng với link, nếu sai link thì về trang 'about'
  const pageInfo = contentData[slug || ''] || contentData['about'];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', minHeight: '50vh', width: '100%' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px' }}>
          {pageInfo.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '20px', fontWeight: '800' }}>
            {pageInfo.title}
          </h1>
          <div style={{ fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
            {pageInfo.text}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoPage;
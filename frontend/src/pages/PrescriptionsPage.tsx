import React, { useState, useEffect } from 'react';
import { Search, Plus, Printer, Eye, Edit, Trash2, FileText, X, PlusCircle } from 'lucide-react';
import { prescriptionService } from '../services/prescription.service';

const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    patientName: '', 
    doctorName: '', 
    diagnosis: '', 
    medsList: [{ name: '', qty: '', usage: '' }] 
  });
  
  const [receiptData, setReceiptData] = useState<any>(null);

  const loadData = async () => {
    try {
      const res: any = await prescriptionService.getAll().catch(() => []);
      setPrescriptions(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractData = (fullText: string) => {
    let diag = '', medsList: any[] = [], legacyMeds = '', legacyInst = '';
    if (!fullText) return { diag, medsList, legacyMeds, legacyInst };

    if (fullText.includes('---[MED_JSON]---')) {
      const parts = fullText.split('\n\n---[MED_JSON]---\n');
      diag = parts[0]?.trim();
      try { medsList = JSON.parse(parts[1]); } catch(e) {}
    } else if (fullText.includes('---[THUOC]---')) {
      const parts1 = fullText.split('\n\n---[THUOC]---\n');
      diag = parts1[0]?.trim() || '';
      const parts2 = (parts1[1] || '').split('\n\n---[HDSD]---\n');
      legacyMeds = parts2[0]?.trim() || '';
      legacyInst = parts2[1]?.trim() || '';
    } else if (fullText.includes('💊 THUỐC KÊ & HƯỚNG DẪN SỬ DỤNG:\n')) {
      const parts = fullText.split('💊 THUỐC KÊ & HƯỚNG DẪN SỬ DỤNG:\n');
      diag = parts[0]?.trim() || '';
      legacyMeds = parts[1]?.trim() || '';
    } else {
      diag = fullText;
    }
    return { diag, medsList, legacyMeds, legacyInst };
  };

  const openModal = (p?: any) => {
    if (p) {
      setEditId(p.id);
      const { diag, medsList, legacyMeds, legacyInst } = extractData(p.diagnosis);
      let initialMeds = medsList;
      if (initialMeds.length === 0) {
        if (legacyMeds || legacyInst) initialMeds = [{ name: legacyMeds, qty: '1', usage: legacyInst }];
        else initialMeds = [{ name: '', qty: '', usage: '' }];
      }
      setFormData({ patientName: p.patientName, doctorName: p.doctorName, diagnosis: diag, medsList: initialMeds });
    } else {
      setEditId(null);
      setFormData({ patientName: '', doctorName: '', diagnosis: '', medsList: [{ name: '', qty: '', usage: '' }] });
    }
    setIsModalOpen(true);
  };

  const updateMed = (index: number, field: string, value: string) => {
    const newList = [...formData.medsList];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, medsList: newList });
  };
  const addMedRow = () => setFormData({ ...formData, medsList: [...formData.medsList, { name: '', qty: '', usage: '' }] });
  const removeMed = (index: number) => setFormData({ ...formData, medsList: formData.medsList.filter((_, i) => i !== index) });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validMeds = formData.medsList.filter(m => m.name.trim() !== '');
      if (validMeds.length === 0) return alert('Vui lòng kê ít nhất 1 loại thuốc!');

      const encodedMeds = JSON.stringify(validMeds);
      const combinedDiagnosis = formData.diagnosis + '\n\n---[MED_JSON]---\n' + encodedMeds;
      
      const payload = { patientName: formData.patientName, doctorName: formData.doctorName, diagnosis: combinedDiagnosis };

      if (editId) await prescriptionService.update(editId, payload);
      else await prescriptionService.create(payload);
      
      setIsModalOpen(false);
      loadData(); 
    } catch (error: any) {
      alert('Có lỗi xảy ra khi lưu đơn thuốc!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Đại ca có chắc chắn muốn xóa đơn thuốc này?')) return;
    try {
      await prescriptionService.delete(id);
      loadData();
    } catch (error) {
      alert('Lỗi khi xóa!');
    }
  };

  const getFormattedDate = (dateString: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    return `Ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`;
  };

  return (
    <>
      <style>
        {`
          /* TUYỆT CHIÊU FONT CHỮ HIỆN ĐẠI CHO TOÀN BỘ TRANG */
          .elegant-font, .elegant-font input, .elegant-font button, .elegant-font textarea, .elegant-font select {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          .custom-input {
            width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #d1d5db; box-sizing: border-box;
            transition: all 0.2s; font-size: 14px; background-color: #f9fafb;
          }
          .custom-input:focus { border-color: #10b981; background-color: #fff; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
          
          .med-row { transition: all 0.2s; }
          .med-row:hover { background-color: #f8fafc; border-radius: 8px; }

          @media print {
            body * { visibility: hidden; }
            #printable-prescription, #printable-prescription * { visibility: visible; }
            
            /* Riêng Form in vẫn giữ font Y khoa cổ điển cho trang trọng */
            #printable-prescription { 
              position: absolute; left: 0; top: 0; width: 100%; padding: 15px; 
              font-family: 'Times New Roman', Times, serif; color: #000;
            }
            .modal-overlay { position: absolute !important; background: transparent !important; }
            .modal-content { box-shadow: none !important; padding: 0 !important; width: 100% !important; border: none !important; }
            .no-print { display: none !important; }
            
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            .brand-name { color: #059669 !important; }
          }
        `}
      </style>

      {/* Áp dụng class elegant-font vào khung ngoài cùng */}
      <div className="elegant-font" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Đơn thuốc kê</h1>
          </div>
          <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}>
            <Plus size={18} /> Kê đơn mới
          </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 16px', backgroundColor: '#f9fafb' }}>
              <Search size={20} color="#9ca3af" />
              <input type="text" placeholder="Tìm kiếm bệnh nhân, bác sĩ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', backgroundColor: 'transparent' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Mã Đơn</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Bệnh Nhân</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Bác Sĩ</th>
                  <th style={{ padding: '16px', fontWeight: '600', width: '35%' }}>Thuốc Đã Kê</th>
                  <th style={{ padding: '16px', fontWeight: '600', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((p, idx) => {
                  const { medsList, legacyMeds } = extractData(p.diagnosis);
                  const firstMedName = medsList.length > 0 ? medsList[0].name : legacyMeds;
                  const moreCount = medsList.length > 1 ? ` & ${medsList.length - 1} loại khác` : '';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#059669' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px', display: 'flex' }}><FileText size={16} color="#059669" /></div>
                          {p.id ? p.id.substring(0,8).toUpperCase() : `DT-00${idx+1}`}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#111827', fontSize: '15px' }}>{p.patientName}</td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>{p.doctorName}</td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        {firstMedName ? <span>{firstMedName} <span style={{color: '#9ca3af', fontSize: '13px'}}>{moreCount}</span></span> : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa cập nhật thuốc</span>}
                      </td>
                      <td style={{ padding: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => { setReceiptData(p); setTimeout(() => window.print(), 200); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#059669', cursor: 'pointer' }} title="In"><Printer size={18} /></button>
                        <button onClick={() => setReceiptData(p)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#3b82f6', cursor: 'pointer' }} title="Xem"><Eye size={18} /></button>
                        <button onClick={() => openModal(p)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', cursor: 'pointer' }} title="Sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' }} title="Xóa"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm/Sửa */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', width: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>{editId ? 'CHỈNH SỬA ĐƠN THUỐC' : 'TẠO ĐƠN THUỐC MỚI'}</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: '#6b7280' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tên bệnh nhân *</label>
                    <input type="text" className="custom-input" required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} placeholder="Nguyễn Văn A..." />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Bác sĩ chỉ định *</label>
                    <input type="text" className="custom-input" required value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} placeholder="BS. Tên Bác Sĩ..." />
                  </div>
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Chẩn đoán bệnh</label>
                  <input type="text" className="custom-input" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} placeholder="Viêm họng, sốt..." />
                </div>

                <div style={{ marginBottom: '32px', backgroundColor: '#f8fafc', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic', color: '#059669', fontFamily: 'serif' }}>Rx.</span>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Chỉ định thuốc</h4>
                  </div>
                  
                  {formData.medsList.map((med, idx) => (
                    <div key={idx} className="med-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start', padding: '8px 0' }}>
                      <div style={{ fontWeight: '700', color: '#94a3b8', width: '24px', paddingTop: '12px', textAlign: 'center' }}>{idx + 1}</div>
                      <div style={{ flex: 2 }}>
                        <input className="custom-input" placeholder="Tên thuốc..." value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} required />
                      </div>
                      <div style={{ width: '100px' }}>
                        <input className="custom-input" placeholder="SL..." value={med.qty} onChange={e => updateMed(idx, 'qty', e.target.value)} required style={{ textAlign: 'center' }} />
                      </div>
                      <div style={{ flex: 3 }}>
                        <input className="custom-input" placeholder="Liều dùng (Sáng 1, tối 1...)" value={med.usage} onChange={e => updateMed(idx, 'usage', e.target.value)} required />
                      </div>
                      {formData.medsList.length > 1 && (
                        <button type="button" onClick={() => removeMed(idx)} style={{ padding: '12px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={20} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addMedRow} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '10px 16px', backgroundColor: 'white', color: '#059669', border: '2px dashed #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }}>
                    <PlusCircle size={18} /> Kê thêm thuốc
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', border: '1px solid #d1d5db', background: 'white', borderRadius: '10px', fontWeight: '700', color: '#374151', cursor: 'pointer', fontSize: '15px' }}>Hủy Bỏ</button>
                  <button type="submit" style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#059669', color: 'white', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>{editId ? 'Cập Nhật Đơn' : 'Lưu Đơn Thuốc'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal IN ĐƠN THUỐC CÓ KẺ BẢNG & MÀU XANH NGỌC */}
        {receiptData && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto' }}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '30px 40px', borderRadius: '12px', width: '700px', margin: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
              <div id="printable-prescription" style={{ color: '#000', fontSize: '14px', lineHeight: '1.5', fontFamily: "'Times New Roman', Times, serif" }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 className="brand-name" style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 'bold', textTransform: 'uppercase', color: '#059669' }}>PHÒNG KHÁM & NHÀ THUỐC PHARMOVA</h2>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px' }}><strong>Đ/c:</strong> Số 123, Đường Xuân Thủy, Cầu Giấy, HN</p>
                    <p style={{ margin: 0, fontSize: '13px' }}><strong>Hotline:</strong> 0988.123.456</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '13px' }}>
                    <p style={{ margin: '0 0 4px 0' }}>Mã đơn: <strong>{receiptData.id ? receiptData.id.substring(0,8).toUpperCase() : 'DT-001'}</strong></p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold', color: '#000' }}>ĐƠN THUỐC</h1>
                  <p style={{ margin: 0, fontStyle: 'italic', fontSize: '13px', color: '#000' }}>{getFormattedDate(receiptData.createdAt)}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', marginBottom: '6px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>Họ tên người bệnh:</div>
                    <div style={{ flex: 1, fontSize: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>{receiptData.patientName}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>Chẩn đoán:</div>
                    <div style={{ flex: 1 }}>{extractData(receiptData.diagnosis).diag || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', minHeight: '150px' }}>
                  <div style={{ fontSize: '24px', margin: '0 0 10px 0', fontStyle: 'italic', fontWeight: 'bold', color: '#000', fontFamily: 'Georgia, serif' }}>Rx.</div>
                  
                  {extractData(receiptData.diagnosis).medsList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#000', border: '1px solid #000' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #000', padding: '8px', width: '8%', textAlign: 'center' }}>STT</th>
                          <th style={{ border: '1px solid #000', padding: '8px', width: '42%', textAlign: 'left' }}>Tên thuốc</th>
                          <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>Số lượng</th>
                          <th style={{ border: '1px solid #000', padding: '8px', width: '35%', textAlign: 'left' }}>Liều dùng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractData(receiptData.diagnosis).medsList.map((med: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</td>
                            <td style={{ border: '1px solid #000', padding: '10px 8px', fontWeight: 'bold' }}>{med.name}</td>
                            <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center' }}>{med.qty}</td>
                            <td style={{ border: '1px solid #000', padding: '10px 8px', fontStyle: 'italic' }}>{med.usage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ paddingLeft: '15px', fontSize: '14px', fontStyle: 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {extractData(receiptData.diagnosis).legacyMeds ? extractData(receiptData.diagnosis).legacyMeds + '\n\n' + extractData(receiptData.diagnosis).legacyInst : 'Bác sĩ chưa kê chi tiết thuốc cho đơn này.'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 60px 0', fontSize: '14px' }}>Bác sĩ điều trị</p>
                    <p style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase' }}>{receiptData.doctorName}</p>
                  </div>
                </div>
                <div style={{ marginTop: '20px', borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', color: '#000' }}>
                  * Khám lại xin mang theo đơn này. Vui lòng uống thuốc đúng giờ.
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '16px', marginTop: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <button onClick={() => setReceiptData(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Đóng Màn Hình</button>
                <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                  <Printer size={18} /> IN ĐƠN THUỐC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrescriptionsPage;
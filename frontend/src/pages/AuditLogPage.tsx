import React, { useState, useEffect } from 'react';
import { Search, Clock, User, Database} from 'lucide-react';
import axiosClient from '../services/axiosClient';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get('/api/audit-logs');
      const data = res.data || res || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải nhật ký hệ thống', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Nhật ký hoạt động (Audit Log)</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Giám sát các thay đổi dữ liệu nhạy cảm của hệ thống</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 16px', backgroundColor: '#f9fafb' }}>
            <Search size={20} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo hành động, tên bảng hoặc người thực hiện..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', backgroundColor: 'transparent' }} 
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px', fontWeight: '600' }}>Thời gian</th>
                <th style={{ padding: '16px', fontWeight: '600' }}>Người thực hiện</th>
                <th style={{ padding: '16px', fontWeight: '600' }}>Hành động</th>
                <th style={{ padding: '16px', fontWeight: '600' }}>Bảng Dữ Liệu</th>
                <th style={{ padding: '16px', fontWeight: '600' }}>Chi tiết (Dữ liệu mới)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Đang tải nhật ký...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy lịch sử hoạt động nào</td></tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '14px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#111827', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#059669" />
                        {log.user?.fullName || 'Hệ thống'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: '700',
                        backgroundColor: log.action === 'DELETE' ? '#fee2e2' : log.action === 'UPDATE' ? '#fef3c7' : '#e0e7ff',
                        color: log.action === 'DELETE' ? '#dc2626' : log.action === 'UPDATE' ? '#d97706' : '#4f46e5'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#4b5563' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Database size={14} />
                        {log.tableName}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#374151', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.newValues || 'Không có chi tiết'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
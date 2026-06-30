import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDashboardStats(startDate?: string, endDate?: string) {
    try {
      let dateCond = '';
      let dateCondWhere = '';
      let dateCondO = '';

      // BƯỚC ĐỆM BỌC THÉP: Xử lý triệt để mọi định dạng ngày do React gửi lên
      if (startDate && endDate && startDate !== 'undefined' && endDate !== 'undefined') {
        const dStart = new Date(startDate);
        const dEnd = new Date(endDate);
        
        // Kiểm tra xem ngày có hợp lệ không (tránh sập SQL do Frontend gửi linh tinh)
        if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
            const y1 = dStart.getFullYear();
            const m1 = String(dStart.getMonth() + 1).padStart(2, '0');
            const d1 = String(dStart.getDate()).padStart(2, '0');
            
            const y2 = dEnd.getFullYear();
            const m2 = String(dEnd.getMonth() + 1).padStart(2, '0');
            const d2 = String(dEnd.getDate()).padStart(2, '0');

            // Ép cứng về định dạng YYYY-MM-DD chuẩn của SQL Server
            const safeStart = `${y1}-${m1}-${d1}`;
            const safeEnd = `${y2}-${m2}-${d2}`;

            dateCond = `AND createdAt >= '${safeStart} 00:00:00' AND createdAt <= '${safeEnd} 23:59:59'`;
            dateCondWhere = `WHERE createdAt >= '${safeStart} 00:00:00' AND createdAt <= '${safeEnd} 23:59:59'`;
            dateCondO = `AND o.createdAt >= '${safeStart} 00:00:00' AND o.createdAt <= '${safeEnd} 23:59:59'`;
        }
      }

      // THỐNG KÊ DOANH THU
      const salesStats = await this.dataSource.query(`
        SELECT 
          COUNT(id) as totalInvoices,
          COALESCE(SUM(totalAmount), 0) as totalRevenue
        FROM Orders
        WHERE 1=1 ${dateCond}
      `);

      // THỐNG KÊ NHẬP HÀNG
      const importStats = await this.dataSource.query(`
        SELECT 
          COUNT(id) as totalImportOrders,
          COALESCE(SUM(totalAmount), 0) as totalImportCost
        FROM PurchaseOrders
        ${dateCondWhere}
      `);

      // TOP SẢN PHẨM BÁN CHẠY
      const topProducts = await this.dataSource.query(`
        SELECT TOP 5
          p.name as productName,
          SUM(oi.quantity) as totalSold,
          SUM(oi.price * oi.quantity) as revenue
        FROM OrderItems oi
        JOIN Products p ON oi.productId = p.id
        JOIN Orders o ON oi.orderId = o.id
        WHERE 1=1 ${dateCondO}
        GROUP BY p.id, p.name
        ORDER BY totalSold DESC
      `);

      // ĐỐI SOÁT HÀNG HÓA
      const reconciliation = await this.dataSource.query(`
        SELECT 
          COUNT(DISTINCT o.id) as totalOrders,
          COALESCE(SUM(oi.quantity), 0) as totalItemsSold
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.id = oi.orderId
        WHERE 1=1 ${dateCondO}
      `);

      // DANH SÁCH 50 HÓA ĐƠN GẦN ĐÂY
      const recentOrders = await this.dataSource.query(`
        SELECT TOP 50
          id,
          createdAt,
          totalAmount,
          N'Khách tại quầy' as customerName
        FROM Orders
        WHERE 1=1 ${dateCond}
        ORDER BY createdAt DESC
      `);

      return {
        overview: {
          totalRevenue: Number(salesStats[0]?.totalRevenue || 0),
          totalInvoices: Number(salesStats[0]?.totalInvoices || 0),
          totalImportCost: Number(importStats[0]?.totalImportCost || 0),
          totalImportOrders: Number(importStats[0]?.totalImportOrders || 0),
        },
        topProducts: topProducts || [],
        reconciliation: {
          ordersCount: Number(reconciliation[0]?.totalOrders || 0),
          itemsSold: Number(reconciliation[0]?.totalItemsSold || 0),
          isMatching: Number(salesStats[0]?.totalInvoices || 0) === Number(reconciliation[0]?.totalOrders || 0)
        },
        recentOrders: recentOrders || []
      };

    } catch (error: any) {
      // In lỗi ra terminal đỏ chóe để anh em dễ bắt bài nếu DB còn làm khó
      console.error('🔥 LỖI CỰC MẠNH KHI CHẠY SQL BÁO CÁO:', error); 
      return {
        overview: { totalRevenue: 0, totalInvoices: 0, totalImportCost: 0, totalImportOrders: 0 },
        topProducts: [],
        reconciliation: { ordersCount: 0, itemsSold: 0, isMatching: true },
        recentOrders: []
      };
    }
  }
}
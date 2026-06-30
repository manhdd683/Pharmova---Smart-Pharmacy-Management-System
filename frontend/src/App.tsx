import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import POSPage from './pages/POSPage';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import ImportPage from './pages/ImportPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import VouchersPage from './pages/VouchersPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage'; 
import AuditLogPage from './pages/AuditLogPage'; 

import ProtectedRoute from './routes/ProtectedRoute'; 
import CustomerLayout from './layouts/CustomerLayout'; 

import CustomerHomePage from './customer/home/CustomerHomePage';
import InfoPage from './customer/home/InfoPage';
import CustomerProfilePage from './customer/profile/CustomerProfilePage';
import CustomerCartPage from './customer/cart/CustomerCartPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="info/:slug" element={<InfoPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="cart" element={<CustomerCartPage />} />
        </Route>

        {/* Quản trị & Nhân viên */}
        <Route path="/admin" element={<MainLayout />}>
          
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Staff']} />}>
            <Route path="pos" element={<POSPage />} />
            <Route path="orders" element={<OrdersPage />} /> 
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route index element={<HomePage />} /> 
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="imports" element={<ImportPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogPage />} />
          </Route>
          
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
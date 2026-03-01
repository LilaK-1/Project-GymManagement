import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import CustomerManagement from './pages/CustomerManagement';
import TrainerManagement from './pages/TrainerManagement';
import StatisticsManagement from './pages/StatisticsManagement';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          {/* Dashboard chính (Trang tổng quan) */}
          <Route index element={<h1>📊 Trang chủ quản lý hệ thống Admin</h1>} />

          {/* Các tùy chọn quản lý của Admin */}
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="trainers" element={<TrainerManagement />} />
          <Route path="statistics" element={<StatisticsManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
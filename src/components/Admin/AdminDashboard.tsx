import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfessionalLoader } from '../Common/ProfessionalLoader';
import { AdminDashboardHome } from './Dashboard/AdminDashboardHome';
import { AdminProductsPage } from './Products/AdminProductsPage';
import { AdminCategoriesPage } from './Categories/AdminCategoriesPage';
import { AdminOrdersPage } from './Orders/AdminOrdersPage';
import { AdminUsersPage } from './Users/AdminUsersPage';
import { AdminAnalyticsPage } from './Analytics/AdminAnalyticsPage';
import { AdminSettingsPage } from './Settings/AdminSettingsPage';
import { AdminContactSubmissionsPage } from './ContactSubmissions/AdminContactSubmissionsPage';
import { AdminPOSPage } from './Orders/AdminPOSPage';

export const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ProfessionalLoader
        fullPage={true}
        text="Loading admin dashboard..."
        showBrand={true}
      />
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="products/*" element={<AdminProductsPage />} />
      <Route path="categories/*" element={<AdminCategoriesPage />} />
      <Route path="orders/*" element={<AdminOrdersPage />} />
      <Route path="users/*" element={<AdminUsersPage />} />
      <Route path="analytics" element={<AdminAnalyticsPage />} />
      <Route path="pos" element={<AdminPOSPage />} />
      <Route path="contact-submissions/*" element={<AdminContactSubmissionsPage />} />
      <Route path="settings/*" element={<AdminSettingsPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

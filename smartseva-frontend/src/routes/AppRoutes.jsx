import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../modules/auth/pages/Login';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import CustomerList from '../modules/customer/pages/CustomerList';
import CustomerDetails from '../modules/customer/pages/CustomerDetails';
import ServiceList from '../modules/servicecatalog/pages/ServiceList';
import ServiceDetails from '../modules/servicecatalog/pages/ServiceDetails';
import ServiceTemplates from '../modules/servicecatalog/pages/ServiceTemplates';
import DocumentVault from '../modules/document/pages/DocumentVault';
import NotificationCenter from '../modules/notification/pages/NotificationCenter';
import StaffList from '../modules/staff/pages/StaffList';
import ActivityLogs from '../modules/activity/pages/ActivityLogs';

import PublicDocumentVerification from '../modules/document/pages/PublicDocumentVerification';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/verify" element={<PublicDocumentVerification />} />
      <Route path="/public/verify" element={<PublicDocumentVerification />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Operations Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/documents" element={<DocumentVault />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/activities" element={<ActivityLogs />} />

        {/* Admin Restricted Routes */}
        <Route path="/admin/staff" element={<AdminRoute><StaffList /></AdminRoute>} />
        <Route path="/admin/templates" element={<AdminRoute><ServiceTemplates /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
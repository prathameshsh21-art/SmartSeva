import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useContext(AuthContext);

  if (loading) return <Loader />;
  return user && isAdmin() ? children : <Navigate to="/dashboard" replace />;
}
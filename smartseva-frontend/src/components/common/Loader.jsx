import React from 'react';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small mt-2">{message}</p>
    </div>
  );
}
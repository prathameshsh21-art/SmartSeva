import React from 'react';
import CustomerFormModal from '../components/CustomerFormModal';

export default function AddCustomer() {

  const handleSubmit = (e) => {
    e.preventDefault();

    // API Integration Later
    console.log('Customer Submitted');
  };

  return (
    <div>

      <h3 className="fw-bold mb-4">
        Register Customer
      </h3>

      <CustomerFormModal
        onSubmit={handleSubmit}
      />

    </div>
  );
}
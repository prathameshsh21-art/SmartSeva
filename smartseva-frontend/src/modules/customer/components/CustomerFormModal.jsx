import React, { useState } from 'react';
import ModalShell from '../../../components/ui/ModalShell';

export default function CustomerFormModal({
  modalId = 'customerFormModal',
  onSubmit
}) {

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <ModalShell
      id={modalId}
      title="Register New Customer"
      onSubmit={handleSubmit}
      submitText="Save Customer"
    >

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            className="form-control"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            Mobile Number
          </label>

          <input
            type="tel"
            name="phoneNumber"
            className="form-control"
            placeholder="10-digit phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            maxLength="10"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            Date of Birth
          </label>

          <input
            type="date"
            name="dateOfBirth"
            className="form-control"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            Email (Optional)
          </label>

          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="email@domain.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

      </form>

    </ModalShell>
  );
}